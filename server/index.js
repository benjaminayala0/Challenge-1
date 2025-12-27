const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database/db');
const { Note } = require('./database/models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Test Route (Ping)
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Pong! Backend is running 🚀' });
});

// 2. GET All Notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.findAll();
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// 3. POST New Note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Backend Validation
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const newNote = await Note.create({ title, content });
        res.json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating note' });
    }
});

// 4. PUT Update Note (Content or Status)
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, isCompleted } = req.body;

        await Note.update(
            { title, content, isCompleted },
            { where: { id: id } }
        );

        res.json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating note' });
    }
});

// 5. DELETE Note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await Note.destroy({
            where: { id: id }
        });
        
        res.sendStatus(204); // 204 = No Content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting note' });
    }
});

// --- SERVER START ---
// Sync Database first, then start server
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database connected & synchronized');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ Database connection error:', error);
    });