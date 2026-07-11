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
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Connect to Neon database (TEMPORARY - for testing)
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_IiFQmsZxg57E@ep-divine-art-ao79aaqf-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
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
// server/index.js - Replace the io.on('connection') section with this

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // --- Existing: Chat message ---
    socket.on('chat message', async (data) => {
        const { username, message } = data;
        console.log(`📩 ${username}: ${message}`);

        try {
            await pool.query(
                'INSERT INTO messages (username, content) VALUES ($1, $2)',
                [username, message]
            );
        } catch (err) {
            console.error('❌ Failed to save:', err.message);
        }

        io.emit('chat message', {
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