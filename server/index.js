const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database/db');
const { Note } = require('./database/models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Habilita CORS para que el front pueda hablar con el back
app.use(express.json());

// Ruta de prueba (Ping)
app.get('/api/ping', (req, res) => {
    res.json({ message: '¡Pong! El backend está vivo 🚀' });
});

// Sincronizar la base de datos y luego iniciar el servidor
sequelize.sync({ force: false })
    .then(() => {
        console.log('✅ Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Server corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ Error al conectar la Base de Datos:', error);
 });

// Ruta para CREAR una nota
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body; // Recibimos datos del front
        
        // Crea y guarda en una línea
        const newNote = await Note.create({ title, content });
        
        res.json(newNote); // Devolvemos la nota creada
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo guardar la nota' });
    }
});

// Ruta para OBTENER todas las notas
app.get('/api/notes', async (req, res) => {
    try {
        // findAll() es el equivalente a "SELECT * FROM Notes"
        const notes = await Note.findAll();
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener notas' });
    }
});

// Ruta para BORRAR una nota por su ID
// Los dos puntos :id indican que es un dato variable (ej: /api/notes/1, /api/notes/55)
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params; // Agarramos el ID de la URL
        
        // destroy es la función de Sequelize para borrar
        await Note.destroy({
            where: { id: id }
        });
        
        res.sendStatus(204); // 204 significa "No Content" (Borrado ok, no devuelvo nada)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo borrar la nota' });
    }
});

// Ruta para ACTUALIZAR una nota
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // update devuelve un array con la cantidad de filas afectadas
        await Note.update(
            { title, content }, // Datos nuevos
            { where: { id: id } } // Cuál actualizamos
        );

        res.json({ message: 'Actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo actualizar' });
    }
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});