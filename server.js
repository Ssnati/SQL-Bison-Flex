const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Asegurarse de que la base de datos exista y ejecutar los scripts SQL
async function ensureDatabase() {
    try {
        // Leer los archivos SQL
        const creationSQL = await fs.readFile('database/creation.sql', 'utf-8');
        const insertsSQL = await fs.readFile('database/inserts.sql', 'utf-8');

        // Ejecutar los scripts en la base de datos
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                // Ejecutar el script de creación
                db.exec(creationSQL, (err) => {
                    if (err) {
                        console.error('Error ejecutando script de creación:', err);
                        reject(err);
                        return;
                    }
                    
                    // Verificar si ya hay datos en la tabla de usuarios
                    db.get('SELECT COUNT(*) as count FROM usuarios', [], (err, row) => {
                        if (err) {
                            console.error('Error verificando datos existentes:', err);
                            reject(err);
                            return;
                        }
                        
                        // Si no hay datos, proceder con la inserción
                        if (row.count === 0) {
                            db.exec(insertsSQL, (err) => {
                                if (err) {
                                    console.error('Error ejecutando script de inserción:', err);
                                    reject(err);
                                    return;
                                }
                                console.log('Datos insertados correctamente');
                                resolve();
                            });
                        } else {
                            console.log('Base de datos ya tiene datos, omitiendo inserción inicial');
                            resolve();
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error al asegurar la base de datos:', error);
        throw error;
    }
}

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
    try {
        // Verificar si el archivo existe
        const stats = await fs.stat(SQL_EXECUTABLE);
        if (!stats.isFile()) {
            throw new Error('El archivo ejecutable no es un archivo válido');
        }
        
        // Establecer permisos de ejecución (solo en sistemas Unix/Linux)
        if (process.platform !== 'win32') {
            try {
                const { execSync } = require('child_process');
                execSync(`chmod +x ${SQL_EXECUTABLE}`);
                console.log('Permisos de ejecución establecidos correctamente');
            } catch (chmodError) {
                console.warn('No se pudieron establecer los permisos de ejecución:', chmodError.message);
                // Continuar de todos modos, ya que el archivo podría ya tener los permisos
            }
        }

        return new Promise((resolve, reject) => {
            const sqlProcess = spawn(SQL_EXECUTABLE, [], { 
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: process.platform === 'win32' // Usar shell en Windows para manejar mejor los ejecutables
            });
            
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
    } catch (error) {
        console.error('Error al verificar el ejecutable:', error);
        throw error;
    }
}

// Función para obtener la última consulta SQL del archivo de resultados
async function getLastSQLQuery() {
    try {
        const content = await fs.readFile(RESULT_FILE, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        return lines[lines.length - 1]; // Devuelve la última línea
    } catch (error) {
        console.error('Error al leer el archivo de resultados:', error);
        return null;
    }
}

// Obtener todas las consultas
app.get('/api/queries', async (req, res) => {
    try {
        const content = await fs.readFile(QUERIES_FILE, 'utf-8');
        const queries = content.split('\n').filter(line => line.trim() !== '');
        res.json({ queries });
    } catch (error) {
        console.error('Error al obtener consultas:', error);
        res.status(500).json({ error: 'Error al obtener consultas' });
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
        
        // Ejecutar la traducción (esto generará el archivo de resultados)
        await translateSQL(query);
        
        // Obtener la última consulta SQL del archivo de resultados
        const sqlQuery = await getLastSQLQuery();
        
        if (!sqlQuery) {
            throw new Error('No se pudo obtener la consulta SQL traducida');
        }

        // Ejecutar la consulta en la base de datos
        await new Promise((resolve, reject) => {
            db.all(sqlQuery, [], (err, rows) => {
                if (err) {
                    console.error('Error al ejecutar la consulta:', err);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        }).then(async (results) => {
            // Obtener todas las consultas para devolverlas
            const content = await fs.readFile(QUERIES_FILE, 'utf-8');
            const queries = content.split('\n').filter(q => q.trim() !== '');
            
            res.json({ 
                success: true, 
                queries,
                lastQuery: query,
                translatedQuery: sqlQuery,
                results
            });
        }).catch(error => {
            console.error('Error al ejecutar la consulta:', error);
            res.status(500).json({ 
                error: error.message || 'Error al ejecutar la consulta' 
            });
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
        
        // Crear un objeto de respuesta consistente
        const response = {
            success: true,
            message: 'Historial de consultas eliminado',
            timestamp: new Date().toISOString()
        };
        
        // Establecer el encabezado Content-Type
        res.setHeader('Content-Type', 'application/json');
        // Enviar la respuesta como JSON
        res.json(response);
    } catch (error) {
        console.error('Error al limpiar consultas:', error);
        
        // Crear un objeto de error consistente
        const errorResponse = {
            success: false,
            error: 'Error al limpiar el historial de consultas',
            details: error.message,
            timestamp: new Date().toISOString()
        };
        
        // Establecer el encabezado Content-Type y el código de estado
        res.status(500).setHeader('Content-Type', 'application/json');
        res.json(errorResponse);
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

// Inicializar el archivo de consultas y la base de datos
async function startServer() {
    try {
        await ensureQueriesFile();
        await ensureDatabase();
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
