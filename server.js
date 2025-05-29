const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const QUERIES_FILE = 'queries.txt';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Crear archivo de consultas si no existe
async function ensureQueriesFile() {
    try {
        await fs.access(QUERIES_FILE);
    } catch (error) {
        await fs.writeFile(QUERIES_FILE, '', 'utf-8');
    }
}

// Obtener todas las consultas
app.get('/api/queries', async (req, res) => {
    try {
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(q => q.trim() !== '');
        res.json({ queries });
    } catch (error) {
        console.error('Error al leer las consultas:', error);
        res.status(500).json({ error: 'Error al leer las consultas' });
    }
});

// Agregar una nueva consulta
app.post('/api/queries', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'La consulta es requerida' });
        }

        // Agregar la nueva consulta al final del archivo
        await fs.appendFile(QUERIES_FILE, query + '\n', 'utf-8');
        
        // Obtener todas las consultas para devolverlas
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(q => q.trim() !== '');
        
        res.json({ 
            success: true, 
            queries,
            lastQuery: query
        });
    } catch (error) {
        console.error('Error al guardar la consulta:', error);
        res.status(500).json({ error: 'Error al guardar la consulta' });
    }
});

// Limpiar todas las consultas
app.delete('/api/queries', async (req, res) => {
    try {
        // Escribir un archivo vacío
        await fs.writeFile(QUERIES_FILE, '', 'utf-8');
        res.json({ success: true, message: 'Historial de consultas eliminado' });
    } catch (error) {
        console.error('Error al limpiar consultas:', error);
        res.status(500).json({ error: 'Error al limpiar el historial de consultas' });
    }
});

// Verificar si hay consultas nuevas
app.get('/api/queries/check', async (req, res) => {
    try {
        const stats = await fs.stat(QUERIES_FILE);
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(q => q.trim() !== '');
        const lastQuery = queries[queries.length - 1] || '';
        
        res.json({ 
            lastModified: stats.mtime.getTime(),
            size: stats.size,
            totalQueries: queries.length,
            lastQuery
        });
    } catch (error) {
        console.error('Error al verificar consultas:', error);
        res.status(500).json({ error: 'Error al verificar consultas' });
    }
});

// Inicializar el archivo de consultas y el servidor
async function startServer() {
    await ensureQueriesFile();
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://${HOST}:${PORT}`);
    });
}

startServer();
