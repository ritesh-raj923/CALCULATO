// script.js - Futuristic Version

// --- Socket Connection ---
const socket = io('https://love-backend-24ef.onrender.com/');

// --- DOM Refs ---
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatUsername = document.getElementById('chatUsername');
const typingIndicator = document.getElementById('typingIndicator');

const name1 = document.getElementById('name1');
const name2 = document.getElementById('name2');
const zodiac1 = document.getElementById('zodiac1');
const zodiac2 = document.getElementById('zodiac2');
const calculateBtn = document.getElementById('calculateBtn');
const resultDisplay = document.getElementById('resultDisplay');
const flamesResult = document.getElementById('flamesResult');
const zodiacBonusDisplay = document.getElementById('zodiacBonusDisplay');
const calcTitle = document.getElementById('calcTitle');
const loveRadarRing = document.getElementById('loveRadarRing');

const loveModeBtn = document.getElementById('loveModeBtn');
const friendshipModeBtn = document.getElementById('friendshipModeBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const container = document.getElementById('appContainer');

// --- State ---
let currentMode = 'love';
let isDarkMode = false;

// --- Dark Mode Toggle ---
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

// --- Mode Toggle ---
loveModeBtn.addEventListener('click', () => {
    currentMode = 'love';
    loveModeBtn.className = 'active';
    friendshipModeBtn.className = '';
    container.classList.remove('friendship-mode');
    calcTitle.textContent = '💕 Love Calculator';
    resultDisplay.innerHTML = '❤️ 0%';
    flamesResult.textContent = '';
    zodiacBonusDisplay.textContent = '';
    updateRadarRing(0);
});

friendshipModeBtn.addEventListener('click', () => {
    currentMode = 'friendship';
    friendshipModeBtn.className = 'friendship-active';
    loveModeBtn.className = '';
    container.classList.add('friendship-mode');
    calcTitle.textContent = '🤝 Friendship Calculator';
    resultDisplay.innerHTML = '💙 0%';
    flamesResult.textContent = '';
    zodiacBonusDisplay.textContent = '';
    updateRadarRing(0);
});

// --- Zodiac Logic ---
function getZodiacElement(sign) {
    const elements = {
        aries: 'fire', leo: 'fire', sagittarius: 'fire',
        taurus: 'earth', virgo: 'earth', capricorn: 'earth',
        gemini: 'air', libra: 'air', aquarius: 'air',
        cancer: 'water', scorpio: 'water', pisces: 'water'
    };
    return elements[sign] || null;
}
function getZodiacCompatibility(sign1, sign2) {
    if (!sign1 || !sign2) return { bonus: 0, message: '' };
    const el1 = getZodiacElement(sign1);
    const el2 = getZodiacElement(sign2);
    if (!el1 || !el2) return { bonus: 0, message: '' };

    if (el1 === el2) {
        if (el1 === 'fire') return { bonus: 15, message: '🔥 Fire + Fire = Passionate!' };
        if (el1 === 'earth') return { bonus: 15, message: '🌍 Earth + Earth = Grounded!' };
        if (el1 === 'air') return { bonus: 15, message: '🌬️ Air + Air = Intellectual!' };
        if (el1 === 'water') return { bonus: 15, message: '🌊 Water + Water = Deep!' };
    }
    if ((el1 === 'fire' && el2 === 'air') || (el1 === 'air' && el2 === 'fire')) {
        return { bonus: 12, message: '🔥 Fire + Air = Sparks fly!' };
    }
    if ((el1 === 'earth' && el2 === 'water') || (el1 === 'water' && el2 === 'earth')) {
        return { bonus: 12, message: '🌍 Earth + Water = Nurturing!' };
    }
    return { bonus: 5, message: '✨ Opposites attract!' };
}

// --- Calculator Logic ---
function calculateCompatibility(name1, name2, mode, sign1, sign2) {
    const clean1 = name1.trim().toLowerCase();
    const clean2 = name2.trim().toLowerCase();
    if (!clean1 || !clean2) return { score: 0, zodiacBonus: 0, zodiacMessage: '' };

    let score = Math.round((clean1.match(/[aeiou]/gi)?.length || 0) / clean1.length * 50) + 
                Math.round((clean2.match(/[aeiou]/gi)?.length || 0) / clean2.length * 50);
    
    if (clean1[0] === clean2[0]) score += 10;
    if (clean1[clean1.length - 1] === clean2[clean2.length - 1]) score += 10;
    if (mode === 'love') score += Math.floor(Math.random() * 8);

    const zodiac = getZodiacCompatibility(sign1, sign2);
    score += zodiac.bonus;

    // FIX: Map to 60-100 range
    const finalScore = Math.min(100, Math.max(60, Math.round(score * 0.4 + 60)));

    return {
        score: Math.min(100, Math.max(0, finalScore)),
        zodiacBonus: zodiac.bonus,
        zodiacMessage: zodiac.message
    };
}

function getFlamesResult(name1, name2) {
    const clean1 = name1.trim().toLowerCase();
    const clean2 = name2.trim().toLowerCase();
    let temp1 = clean1.split('');
    let temp2 = clean2.split('');
    for (let i = 0; i < temp1.length; i++) {
        const index = temp2.indexOf(temp1[i]);
        if (index !== -1) { temp2.splice(index, 1); temp1.splice(i, 1); i--; }
    }
    const count = temp1.length + temp2.length;
    const flames = ['Friendship', 'Love', 'Affection', 'Marriage', 'Enemy', 'Sibling'];
    if (count === 0) return '💕 Soulmates!';
    if (count === 1) return '💖 Perfect Match!';
    return flames[count % flames.length];
}

// --- Update the Futuristic Radar Ring ---
function updateRadarRing(percentage) {
    const circumference = 471.24; // 2 * PI * 75
    const offset = circumference - (percentage / 100) * circumference;
    loveRadarRing.style.strokeDashoffset = offset;
    
    // Change ring color based on score
    if (percentage > 80) loveRadarRing.style.stroke = '#f5576c';
    else if (percentage > 60) loveRadarRing.style.stroke = '#ffb347';
    else loveRadarRing.style.stroke = '#4facfe';
}

// --- Calculate Button ---
calculateBtn.addEventListener('click', () => {
    const n1 = name1.value || 'You';
    const n2 = name2.value || 'Your Partner';
    const sign1 = zodiac1.value;
    const sign2 = zodiac2.value;

    const result = calculateCompatibility(n1, n2, currentMode, sign1, sign2);
    const score = result.score;

    // Update Radar Ring
    updateRadarRing(score);

    // Update Text Result with animation
    let current = 0;
    const interval = setInterval(() => {
        if (current >= score) { clearInterval(interval); return; }
        current += 1;
        const heart = currentMode === 'love' ? '❤️' : '💙';
        resultDisplay.innerHTML = `${heart} ${current}%`;
    }, 15);

    // Zodiac Bonus
    if (sign1 && sign2) {
        zodiacBonusDisplay.textContent = `🌟 Zodiac: +${result.zodiacBonus}% — ${result.zodiacMessage}`;
    } else {
        zodiacBonusDisplay.textContent = '';
    }

    // Flames & Messages
    if (currentMode === 'love') {
        const flames = getFlamesResult(n1, n2);
        let msg = '';
        if (score >= 90) msg = '💕 Cosmic twins! Destined forever! ✨';
        else if (score >= 75) msg = '💖 A match made in heaven! Special bond! 💖';
        else if (score >= 60) msg = '🌹 The spark is there! Keep watering it! 🌹';
        else msg = '💫 A wonderful connection! You are amazing! 🌟';
        flamesResult.textContent = `✨ ${flames} ✨ — ${msg}`;
        if (score > 80) createCelebration();
    } else {
        flamesResult.textContent = score > 70 ? '🌟 Best Friends Forever!' : '💪 Keep building that bond!';
    }
});

// --- Celebration ---
function createCelebration() {
    const emojis = ['❤️', '✨', '💕', '🌟', '🎉', '💖'];
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `position:fixed; left:${Math.random()*100}vw; top:-20px; font-size:${Math.random()*30+20}px; pointer-events:none; z-index:999; animation: fall ${Math.random()*3+2}s linear forwards;`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 5000);
        }, i * 100);
    }
}
document.head.insertAdjacentHTML('beforeend', `<style>@keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }</style>`);

// --- Floating Hearts ---
function createFloatingHeart() {
    const container = document.getElementById('heartsContainer');
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.textContent = ['❤️', '💕', '💖', '♥️'][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
    heart.style.animationDuration = (Math.random() * 8 + 8) + 's';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 16000);
}
setInterval(createFloatingHeart, 500);

// --- Chat & Typing Indicator ---
socket.on('chat message', (data) => {
    const { username, message, timestamp } = data;
    const msgEl = document.createElement('div');
    msgEl.classList.add('message');
    if (username === chatUsername.value.trim()) msgEl.classList.add('own');
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    msgEl.innerHTML = `<div class="username">${escapeHtml(username)} <span class="time">${timeStr}</span></div><div>${escapeHtml(message)}</div>`;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// --- Typing Indicator Logic ---
let typingTimeout;
chatInput.addEventListener('input', () => {
    const username = chatUsername.value.trim() || 'Anonymous';
    socket.emit('typing', username);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop-typing');
    }, 1000);
});

socket.on('user-typing', (data) => {
    typingIndicator.textContent = `💬 ${escapeHtml(data.username)} is typing...`;
    typingIndicator.style.display = 'block';
});

socket.on('user-stopped-typing', () => {
    typingIndicator.style.display = 'none';
});

// --- Send Message ---
function sendMessage() {
    const message = chatInput.value.trim();
    const username = chatUsername.value.trim() || 'Anonymous';
    if (message) {
        socket.emit('chat message', { username, message });
        chatInput.value = '';
        socket.emit('stop-typing');
    }
}
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// --- Load History ---
async function loadHistory() {
    try {
        const response = await fetch('https://love-backend-24ef.onrender.com//messages');
        const messages = await response.json();
        messages.reverse().forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.classList.add('message');
            if (msg.username === chatUsername.value.trim()) msgEl.classList.add('own');
            const timeStr = new Date(msg.timestamp).toLocaleTimeString();
            msgEl.innerHTML = `<div class="username">${escapeHtml(msg.username)} <span class="time">${timeStr}</span></div><div>${escapeHtml(msg.content)}</div>`;
            messagesDiv.appendChild(msgEl);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (err) { console.error(err); }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Format date for display
function formatDate(dateStr) {
    if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    // Already in YYYY-MM-DD format
    const parts = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`;
}
// --- Init ---
loadHistory();
updateRadarRing(0);
chatInput.focus();
// --- Countdown Timer ---
// --- Special Days (Events) Logic ---

let eventsData = [];
let countdownIntervals = {};

function getNextDate(dateStr) {
    const today = new Date();
    let year, month, day;
    
    // Check if it's a full timestamp (like "2005-01-25T18:30:00.000Z")
    if (dateStr.includes('T')) {
        const dateObj = new Date(dateStr);
        year = dateObj.getFullYear();
        month = dateObj.getMonth() + 1; // JavaScript months are 0-indexed
        day = dateObj.getDate();
    } else {
        // It's a simple YYYY-MM-DD format
        const parts = dateStr.split('-').map(Number);
        year = parts[0];
        month = parts[1];
        day = parts[2];
    }
    
    let nextDate = new Date(today.getFullYear(), month - 1, day);
    
    // If the date already passed this year, move to next year
    if (nextDate < today) {
        nextDate.setFullYear(today.getFullYear() + 1);
    }
    return nextDate;
}

// Format time difference to Days, Hours, Minutes, Seconds
function getTimeDiff(targetDate) {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        return { days: '🎉', hours: '🎉', minutes: '🎉', seconds: '🎉', isToday: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
        days: days,
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isToday: false
    };
}

// Render all events
function renderEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (!events || events.length === 0) {
        container.innerHTML = `<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">
            No special days added yet. Add your first one above! ❤️
        </p>`;
        return;
    }

    // Sort events by next occurrence (soonest first)
    const sorted = [...events].sort((a, b) => {
        const dateA = getNextDate(a.event_date);
        const dateB = getNextDate(b.event_date);
        return dateA - dateB;
    });

    let html = '';
    sorted.forEach(event => {
        const targetDate = getNextDate(event.event_date);
        const diff = getTimeDiff(targetDate);
        const isToday = diff.isToday;

        // If today, trigger celebration
        if (isToday) {
            createCelebration();
        }

        html += `
            <div class="event-card" id="event-${event.id}">
                <div class="event-info">
                    <span class="event-name">${escapeHtml(event.name)}</span>
                   <span style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">
    ${formatDate(event.event_date)}
</span>
                </div>
                <div class="event-countdown">
                    <div class="event-countdown-item">
                        <span class="number" id="event-days-${event.id}">${isToday ? '🎉' : diff.days}</span>
                        <span class="label">Days</span>
                    </div>
                    <div class="event-countdown-item">
                        <span class="number" id="event-hours-${event.id}">${isToday ? '🎉' : diff.hours}</span>
                        <span class="label">Hrs</span>
                    </div>
                    <div class="event-countdown-item">
                        <span class="number" id="event-mins-${event.id}">${isToday ? '🎉' : diff.minutes}</span>
                        <span class="label">Min</span>
                    </div>
                    <div class="event-countdown-item">
                        <span class="number" id="event-secs-${event.id}">${isToday ? '🎉' : diff.seconds}</span>
                        <span class="label">Sec</span>
                    </div>
                    <button class="event-delete-btn" onclick="deleteEvent(${event.id})" title="Delete this event">✖</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Update a single event's countdown (called every second)
function updateEventCountdowns() {
    if (!eventsData || eventsData.length === 0) return;

    eventsData.forEach(event => {
        const targetDate = getNextDate(event.event_date);
        const diff = getTimeDiff(targetDate);
        
        const daysEl = document.getElementById(`event-days-${event.id}`);
        const hoursEl = document.getElementById(`event-hours-${event.id}`);
        const minsEl = document.getElementById(`event-mins-${event.id}`);
        const secsEl = document.getElementById(`event-secs-${event.id}`);

        if (daysEl) {
            if (diff.isToday) {
                daysEl.textContent = '🎉';
                hoursEl.textContent = '🎉';
                minsEl.textContent = '🎉';
                secsEl.textContent = '🎉';
            } else {
                daysEl.textContent = diff.days;
                hoursEl.textContent = diff.hours;
                minsEl.textContent = diff.minutes;
                secsEl.textContent = diff.seconds;
            }
        }
    });
}

// Add a new event
async function addEvent() {
    const nameInput = document.getElementById('eventName');
    const dateInput = document.getElementById('eventDate');
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name) {
        alert('Please enter an event name!');
        nameInput.focus();
        return;
    }
    if (!date) {
        alert('Please select a date!');
        dateInput.focus();
        return;
    }

    try {
        const response = await fetch('https://love-backend-24ef.onrender.com//events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, eventDate: date })
        });
        const result = await response.json();
        if (result.success) {
            // Clear inputs
            nameInput.value = '';
            dateInput.value = '';
            // Refresh the list
            await fetchEvents();
        } else {
            alert('Failed to add event. Please try again.');
        }
    } catch (err) {
        console.error('Error adding event:', err);
        alert('Server error. Please try again.');
    }
}

// Delete an event
async function deleteEvent(id) {
    if (!confirm('Remove this special day?')) return;

    try {
        const response = await fetch(`https://love-backend-24ef.onrender.com//events/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            await fetchEvents();
        } else {
            alert('Failed to delete event.');
        }
    } catch (err) {
        console.error('Error deleting event:', err);
        alert('Server error.');
    }
}

// Fetch all events from server
async function fetchEvents() {
    try {
        const response = await fetch('https://love-backend-24ef.onrender.com//events');
        const data = await response.json();
        eventsData = data;
        renderEvents(eventsData);
    } catch (err) {
        console.error('Error fetching events:', err);
        document.getElementById('eventsList').innerHTML = `
            <p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">
                ❌ Failed to load special days. Please refresh.
            </p>
        `;
    }
}

// --- Socket.IO: Listen for events updates ---
socket.on('events-updated', () => {
    // Refresh the list when someone adds/deletes an event
    fetchEvents();
});

// --- Event Listeners ---
document.getElementById('addEventBtn').addEventListener('click', addEvent);

// Allow pressing Enter to add event
document.getElementById('eventName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEvent();
});
document.getElementById('eventDate').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEvent();
});

// --- Start countdown updates every second ---
setInterval(updateEventCountdowns, 1000);

// --- Initial fetch ---
fetchEvents();
