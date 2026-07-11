// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "https://love-frontend-t61k.onrender.com",
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: "https://love-frontend-t61k.onrender.com"
}));
app.use(express.json());
// Connect to Neon database (TEMPORARY - for testing)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// API: Get recent messages
app.get('/messages', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).send('Server Error');
    }
});
// --- Events API (Special Days) ---

// GET: Fetch all events
app.get('/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST: Add a new event
app.post('/events', async (req, res) => {
    const { name, eventDate } = req.body;
    if (!name || !eventDate) {
        return res.status(400).json({ error: 'Name and date are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO events (name, event_date) VALUES ($1, $2) RETURNING *',
            [name, eventDate]
        );
        const newEvent = result.rows[0];
        
        // Broadcast to all connected clients that events were updated
        io.emit('events-updated');
        
        res.json({ success: true, event: newEvent });
    } catch (err) {
        console.error('Error saving event:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE: Remove an event
app.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM events WHERE id = $1', [id]);
        
        // Broadcast to all connected clients
        io.emit('events-updated');
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting event:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE: Delete specific messages by IDs
app.delete('/messages', async (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !ids.length) {
        return res.status(400).json({ error: 'No message IDs provided' });
    }

    try {
        // Create placeholders for the SQL query (e.g., $1, $2, $3, ...)
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        const query = `DELETE FROM messages WHERE id IN (${placeholders})`;
        
        await pool.query(query, ids);
        
        // Broadcast to all clients that messages were deleted
        io.emit('messages-deleted', { ids });
        
        res.json({ success: true, deletedCount: ids.length });
    } catch (err) {
        console.error('Error deleting messages:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});
// server/index.js - Replace the io.on('connection') section with this

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // --- Existing: Chat message ---
    socket.on('chat message', async (data) => {
    const { username, message } = data;
    console.log(`📩 ${username}: ${message}`);

    let newMessageId = null;

    try {
        const result = await pool.query(
            'INSERT INTO messages (username, content) VALUES ($1, $2) RETURNING id',
            [username, message]
        );
        newMessageId = result.rows[0].id; // Get the ID of the inserted message
    } catch (err) {
        console.error('❌ Failed to save:', err.message);
    }

    io.emit('chat message', {
        id: newMessageId,        // ← ADD THIS
        username,
        message,
        timestamp: new Date()
    });
});
    // --- NEW: Typing Indicator ---
    socket.on('typing', (username) => {
        // Broadcast to everyone EXCEPT the sender that someone is typing
        socket.broadcast.emit('user-typing', { username });
    });

    socket.on('stop-typing', () => {
        socket.broadcast.emit('user-stopped-typing');
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
