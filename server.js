const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const QUERIES_FILE = 'queries.txt';
const RESULT_FILE = 'queries-result.txt';
const SQL_EXECUTABLE = './sql'; // Ajusta la ruta según donde esté tu ejecutable

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

async function translateSQL(query) {
    return new Promise((resolve, reject) => {
        const sqlProcess = spawn(SQL_EXECUTABLE, [], { stdio: ['pipe', 'pipe', 'pipe'] });
        sqlProcess.stdin.write(query + '\n');
        sqlProcess.stdin.end();

        let result = '';
        sqlProcess.stdout.on('data', (data) => result += data.toString());

        sqlProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Error en el proceso SQL (código: ${code})`));
                return;
            }

            try {
                const lines = result.split('\n').filter(line => line.trim() !== '');
                const lastLine = lines[lines.length - 1];
                resolve(lastLine);
            } catch (error) {
                reject(new Error('Error procesando el resultado SQL'));
            }
        });

        sqlProcess.stderr.on('data', (data) => {
            reject(new Error(`Error en el proceso SQL: ${data.toString()}`));
        });
    });
}

// Obtener todas las consultas
app.get('/api/queries/check', async (req, res) => {
    try {
        const stats = await fs.stat(QUERIES_FILE);
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(q => q.trim() !== '');
        const lastQuery = queries[queries.length - 1] || '';
        
        // Traducir la última consulta
        const translatedQuery = lastQuery ? await translateSQL(lastQuery) : '';
        
        res.json({ 
            lastModified: stats.mtime.getTime(),
            size: stats.size,
            totalQueries: queries.length,
            lastQuery: {
                original: lastQuery,
                translated: translatedQuery
            }
        });
    } catch (error) {
        console.error('Error al verificar consultas:', error);
        res.status(500).json({ error: 'Error al verificar consultas' });
    }
});

// Agregar una nueva consulta
app.post('/api/queries', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'La consulta es requerida' });
        }

        // Guardar la consulta original
        await fs.appendFile(QUERIES_FILE, query + '\n', 'utf-8');
        
        // Traducir la consulta usando el ejecutable SQL
        const sqlQuery = await translateSQL(query);
        
        // Obtener todas las consultas para devolverlas
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(q => q.trim() !== '');
        
        res.json({ 
            success: true, 
            queries,
            lastQuery: query,
            translatedQuery: sqlQuery
        });
    } catch (error) {
        console.error('Error al procesar la consulta:', error);
        res.status(500).json({ 
            error: error.message || 'Error al procesar la consulta' 
        });
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
