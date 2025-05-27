const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir archivos estáticos

// Ruta para obtener el contenido del archivo de consultas
app.get('/api/queries', async (req, res) => {
    try {
        const content = await fs.readFile('queries.sql', 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error('Error al leer el archivo de consultas:', error);
        res.status(500).json({ error: 'Error al leer el archivo de consultas' });
    }
});

// Ruta para guardar el contenido en el archivo de consultas
app.post('/api/queries', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'El contenido es requerido' });
        }
        
        await fs.writeFile('queries.sql', content, 'utf-8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error al guardar el archivo de consultas:', error);
        res.status(500).json({ error: 'Error al guardar el archivo de consultas' });
    }
});

// Ruta para verificar cambios en el archivo
app.get('/api/queries/check', async (req, res) => {
    try {
        const stats = await fs.stat('queries.sql');
        res.json({ 
            lastModified: stats.mtime.getTime(),
            size: stats.size
        });
    } catch (error) {
        console.error('Error al verificar cambios en el archivo:', error);
        res.status(500).json({ error: 'Error al verificar cambios en el archivo' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
