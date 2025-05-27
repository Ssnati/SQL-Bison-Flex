// Variables globales
let db;
let editor;

// Datos de ejemplo para poblar la base de datos
const sampleData = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', age: 32, status: 'active', created_at: '2023-05-26' },
    { id: 2, name: 'María García', email: 'maria@example.com', age: 28, status: 'inactive', created_at: '2023-05-25' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', age: 45, status: 'active', created_at: '2023-05-24' },
    { id: 4, name: 'Ana Martínez', email: 'ana@example.com', age: 35, status: 'pending', created_at: '2023-05-23' },
    { id: 5, name: 'Pedro Sánchez', email: 'pedro@example.com', age: 29, status: 'active', created_at: '2023-05-22' },
    { id: 6, name: 'Laura Ruiz', email: 'laura@example.com', age: 41, status: 'inactive', created_at: '2023-05-21' },
    { id: 7, name: 'David Torres', email: 'david@example.com', age: 37, status: 'active', created_at: '2023-05-20' },
    { id: 8, name: 'Elena Castro', email: 'elena@example.com', age: 31, status: 'pending', created_at: '2023-05-19' },
    { id: 9, name: 'Javier Díaz', email: 'javier@example.com', age: 26, status: 'active', created_at: '2023-05-18' },
    { id: 10, name: 'Sofía Méndez', email: 'sofia@example.com', age: 33, status: 'inactive', created_at: '2023-05-17' },
    { id: 11, name: 'Juan Pérez', email: 'juan4@example.com', age: 32, status: 'active', created_at: '2023-05-26' },
    { id: 12, name: 'María García', email: 'maria4@example.com', age: 28, status: 'inactive', created_at: '2023-05-25' },
    { id: 13, name: 'Carlos López', email: 'carlos4@example.com', age: 45, status: 'active', created_at: '2023-05-24' },
    { id: 14, name: 'Ana Martínez', email: 'ana4@example.com', age: 35, status: 'pending', created_at: '2023-05-23' },
    { id: 15, name: 'Pedro Sánchez', email: 'pedroa@example.com', age: 29, status: 'active', created_at: '2023-05-22' },
    { id: 16, name: 'Laura Ruiz', email: 'lauraa@example.com', age: 41, status: 'inactive', created_at: '2023-05-21' },
    { id: 17, name: 'David Torres', email: 'davida@example.com', age: 37, status: 'active', created_at: '2023-05-20' },
    { id: 18, name: 'Elena Castro', email: 'elenaa@example.com', age: 31, status: 'pending', created_at: '2023-05-19' },
    { id: 19, name: 'Javier Díaz', email: 'javiera@example.com', age: 26, status: 'active', created_at: '2023-05-18' },
    { id: 20, name: 'Sofía Méndez', email: 'sofiaa@example.com', age: 33, status: 'inactive', created_at: '2023-05-17' },
    { id: 21, name: 'Juan Pérez', email: 'juana@example.com', age: 32, status: 'active', created_at: '2023-05-26' },
    { id: 22, name: 'María García', email: 'mariaa@example.com', age: 28, status: 'inactive', created_at: '2023-05-25' },
    { id: 23, name: 'Carlos López', email: 'carlosa@example.com', age: 45, status: 'active', created_at: '2023-05-24' },
    { id: 24, name: 'Ana Martínez', email: 'anaaa@example.com', age: 35, status: 'pending', created_at: '2023-05-23' },
    { id: 25, name: 'Pedro Sánchez', email: 'pedro1@example.com', age: 29, status: 'active', created_at: '2023-05-22' },
    { id: 26, name: 'Laura Ruiz', email: 'laura1@example.com', age: 41, status: 'inactive', created_at: '2023-05-21' },
    { id: 27, name: 'David Torres', email: 'david1@example.com', age: 37, status: 'active', created_at: '2023-05-20' },
    { id: 28, name: 'Elena Castro', email: 'elena1@example.com', age: 31, status: 'pending', created_at: '2023-05-19' },
    { id: 29, name: 'Javier Díaz', email: 'javier1@example.com', age: 26, status: 'active', created_at: '2023-05-18' },
    { id: 30, name: 'Sofía Méndez', email: 'sofia1@example.com', age: 33, status: 'inactive', created_at: '2023-05-17' }
];

// Inicializar la base de datos SQL.js
async function initDatabase() {
    try {
        // Cargar SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
        });
        
        // Crear una nueva base de datos
        db = new SQL.Database();
        
        // Crear tabla de ejemplo
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                age INTEGER,
                status TEXT,
                created_at DATE
            );
        `);
        
        // Insertar datos de ejemplo si la tabla está vacía
        const result = db.exec("SELECT COUNT(*) as count FROM users");
        if (result[0].values[0][0] === 0) {
            const stmt = db.prepare("INSERT INTO users (id, name, email, age, status, created_at) VALUES (?, ?, ?, ?, ?, ?)");
            sampleData.forEach(user => {
                stmt.run([user.id, user.name, user.email, user.age, user.status, user.created_at]);
            });
            stmt.free();
        }
        
        // Crear tabla de resultados
        db.run('CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY, description TEXT, date TEXT, status TEXT)');
        
        console.log('Base de datos inicializada correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        showError('Error al inicializar la base de datos: ' + error.message);
        return false;
    }
}

// Inicializar el editor de código
function initCodeEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById('sqlQuery'), {
        mode: 'text/x-sql',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentWithTabs: false,
        tabSize: 2,
        extraKeys: {
            'Ctrl-Enter': executeQuery,
            'Cmd-Enter': executeQuery
        }
    });
    
    // Establecer consulta por defecto
    editor.setValue('SELECT * FROM users;');
}

// Ejecutar consulta SQL
async function executeQuery() {
    const query = editor.getValue().trim();
    if (!query) return;
    
    // Limpiar resultados anteriores
    document.getElementById('resultsTable').innerHTML = '';
    document.getElementById('resultsHeader').innerHTML = '';
    document.getElementById('noResults').classList.add('d-none');
    document.getElementById('errorMessage').classList.add('d-none');
    document.getElementById('queryInfo').classList.add('d-none');
    
    try {
        const startTime = performance.now();
        const results = db.exec(query);
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);
        
        // Mostrar tiempo de ejecución
        document.getElementById('queryTime').textContent = `Tiempo de ejecución: ${executionTime}ms`;
        
        if (results.length === 0) {
            showNoResults();
            return;
        }
        
        // Procesar resultados
        const result = results[0];
        const columns = result.columns;
        const values = result.values;
        
        // Actualizar contador de filas
        document.getElementById('rowCount').textContent = `${values.length} fila${values.length !== 1 ? 's' : ''}`;
        
        // Mostrar encabezados
        const thead = document.getElementById('resultsHeader');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        
        // Mostrar datos
        const tbody = document.getElementById('resultsTable');
        
        values.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                const columnName = columns[colIndex].toLowerCase();
                
                // Formatear fechas
                if (cell !== null && typeof cell === 'string' && cell.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const date = new Date(cell);
                    td.textContent = date.toLocaleDateString('es-ES');
                } 
                // Solo convertir a Sí/No si es una columna de estado o booleana
                else if ((columnName === 'status' || columnName.endsWith('_active') || columnName.endsWith('_status')) && (cell === 1 || cell === 0)) {
                    td.textContent = cell ? 'Sí' : 'No';
                    td.classList.add('text-center');
                }
                // Para cualquier otro valor, incluyendo IDs
                else {
                    td.textContent = cell !== null ? cell : 'NULL';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        // Mostrar información de la consulta
        showQueryInfo(`Consulta ejecutada correctamente. ${values.length} fila${values.length !== 1 ? 's' : ''} devuelta${values.length !== 1 ? 's' : ''}.`);
        
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        showError('Error en la consulta SQL: ' + error.message);
    }
}

// Mostrar mensaje de error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Mostrar mensaje informativo
function showQueryInfo(message) {
    const infoDiv = document.getElementById('queryInfo');
    infoDiv.textContent = message;
    infoDiv.classList.remove('d-none');
}

// Mostrar mensaje cuando no hay resultados
function showNoResults() {
    document.getElementById('noResults').classList.remove('d-none');
    document.getElementById('rowCount').textContent = '0 filas';
    document.getElementById('queryTime').textContent = 'Tiempo de ejecución: 0ms';
}

// Limpiar el editor
function clearEditor() {
    editor.setValue('');
    document.getElementById('resultsTable').innerHTML = '';
    document.getElementById('resultsHeader').innerHTML = '';
    document.getElementById('noResults').classList.add('d-none');
    document.getElementById('errorMessage').classList.add('d-none');
    document.getElementById('queryInfo').classList.add('d-none');
    document.getElementById('rowCount').textContent = '0 filas';
    document.getElementById('queryTime').textContent = 'Tiempo de ejecución: 0ms';
}

// Variables para el seguimiento del estado
let lastModifiedTime = 0;
let fileChangeInterval = null;
let queriesHistory = [];
let currentQuery = '';

// Función para cargar el historial de consultas
async function loadQueriesHistory() {
    try {
        updateFileStatus('Cargando historial...', 'info');
        const response = await fetch('/api/queries');
        if (!response.ok) throw new Error('No se pudo cargar el historial');
        
        const data = await response.json();
        queriesHistory = data.queries || [];
        updateQueriesHistory();
        
        if (queriesHistory.length > 0) {
            currentQuery = queriesHistory[queriesHistory.length - 1];
            editor.setValue(currentQuery);
            updateFileStatus('Historial cargado', 'success');
            return currentQuery;
        }
        return '';
    } catch (error) {
        console.error('Error al cargar el historial:', error);
        updateFileStatus('Error al cargar historial', 'danger');
        return '';
    }
}

// Función para obtener la última consulta del archivo
function getLastQuery(content) {
    if (!content) return '';
    
    // Dividir por líneas y filtrar líneas vacías y comentarios
    const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('--'));
    
    // Devolver la última línea no vacía
    return lines[lines.length - 1] || '';
}

// Función para verificar si hay nuevas consultas
async function checkForNewQueries() {
    try {
        const response = await fetch(`/api/queries/check?t=${new Date().getTime()}`);
        if (!response.ok) return false;
        
        const data = await response.json();
        
        if (data.lastModified > lastModifiedTime) {
            lastModifiedTime = data.lastModified;
            
            // Si hay una nueva consulta, actualizar el historial
            if (data.lastQuery && data.lastQuery !== currentQuery) {
                currentQuery = data.lastQuery;
                await loadQueriesHistory();
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error al verificar consultas:', error);
        return false;
    }
}

// Función para ejecutar la consulta actual
async function executeCurrentQuery() {
    const query = editor.getValue().trim();
    if (!query) return;
    
    try {
        updateFileStatus('Guardando consulta...', 'info');
        
        // Guardar la consulta en el servidor
        const response = await fetch('/api/queries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar la consulta');
        }
        
        // Actualizar el historial
        const data = await response.json();
        queriesHistory = data.queries;
        updateQueriesHistory();
        
        // Ejecutar la consulta
        executeQuery();
        updateFileStatus('Consulta guardada', 'success');
    } catch (error) {
        console.error('Error al guardar la consulta:', error);
        updateFileStatus('Error al guardar', 'danger');
    }
}

// Función para actualizar el estado del archivo en la interfaz
function updateFileStatus(message, type = 'info') {
    const statusElement = document.getElementById('fileStatus');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `badge bg-${type} text-${type === 'light' ? 'dark' : 'white'} ms-2`;
    
    // Restaurar el estado después de 3 segundos
    if (type !== 'info') {
        setTimeout(() => {
            if (statusElement.textContent === message) {
                statusElement.textContent = 'Listo';
                statusElement.className = 'badge bg-light text-dark ms-2';
            }
        }, 3000);
    }
}

// Función para actualizar la marca de tiempo de la última actualización
function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateElement = document.getElementById('lastUpdated');
    if (dateElement) {
        dateElement.textContent = `Última actualización: ${timeString}`;
    }
}

// Función para actualizar la interfaz del historial de consultas
function updateQueriesHistory() {
    const historyList = document.getElementById('queriesHistory');
    const queryCountElement = document.getElementById('queryCount');
    
    if (!historyList || !queryCountElement) return;
    
    // Actualizar el contador de consultas
    queryCountElement.textContent = queriesHistory.length;
    
    // Si no hay consultas, mostrar mensaje
    if (queriesHistory.length === 0) {
        historyList.innerHTML = `
            <li class="list-group-item text-muted text-center py-4">
                <i class="bi bi-clock-history d-block mb-2" style="font-size: 2rem;"></i>
                No hay consultas en el historial
            </li>`;
        return;
    }
    
    // Limitar el historial a 7 elementos
    const limitedHistory = queriesHistory.slice(-7);
    
    // Limpiar la lista
    historyList.innerHTML = '';
    
    // Agregar cada consulta al historial (las más recientes primero)
    [...limitedHistory].reverse().forEach((query, index) => {
        const li = document.createElement('li');
        li.className = 'query-item' + (query === currentQuery ? ' active' : '');
        
        // Crear un elemento de texto con la consulta
        const queryText = document.createElement('div');
        queryText.className = 'query-text';
        queryText.textContent = query;
        
        // Agregar ícono de consulta
        const icon = document.createElement('i');
        icon.className = 'bi bi-arrow-return-right me-2 text-muted';
        
        // Agregar elementos al elemento de la lista
        li.appendChild(icon);
        li.appendChild(queryText);
        
        // Al hacer clic en una consulta anterior, cargarla en el editor
        li.addEventListener('click', () => {
            // Actualizar la consulta actual
            currentQuery = query;
            editor.setValue(query);
            
            // Actualizar las clases activas
            document.querySelectorAll('.query-item').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
            
            // Ejecutar la consulta automáticamente
            executeQuery();
        });
        
        historyList.appendChild(li);
    });
    
    // Mostrar mensaje si no hay consultas
    if (queriesHistory.length === 0) {
        historyList.innerHTML = `
            <li class="list-group-item text-muted text-center py-4">
                <i class="bi bi-clock-history d-block mb-2" style="font-size: 2rem;"></i>
                No hay consultas en el historial
            </li>`;
    }
}

// Función para alternar la visibilidad del historial
function toggleHistory() {
    const historyContainer = document.querySelector('.history-container');
    const toggleButton = document.getElementById('toggleHistory');
    
    if (!historyContainer || !toggleButton) return;
    
    // Alternar la clase 'visible' para mostrar/ocultar el historial
    const isVisible = historyContainer.classList.toggle('visible');
    
    // Actualizar el ícono y el texto del botón
    if (isVisible) {
        toggleButton.innerHTML = '<i class="bi bi-chevron-up me-1"></i> Ocultar historial';
        // Asegurarse de que el historial esté actualizado cuando se muestra
        loadQueriesHistory();
    } else {
        toggleButton.innerHTML = '<i class="bi bi-chevron-down me-1"></i> Mostrar historial';
    }
}

// Inicializar la aplicación
async function initApp() {
    try {
        // Inicializar el editor de código
        initCodeEditor();
        
        // Configurar eventos
        document.getElementById('executeQuery').addEventListener('click', executeCurrentQuery);
        document.getElementById('toggleHistory').addEventListener('click', toggleHistory);
        
        // Inicializar la base de datos
        const dbInitialized = await initDatabase();
        
        if (dbInitialized) {
            // Cargar el historial de consultas
            await loadQueriesHistory();
            
            // Si hay consultas previas, ejecutar la última
            if (currentQuery) {
                executeQuery();
            }
            
            // Verificar nuevas consultas cada 2 segundos
            fileChangeInterval = setInterval(async () => {
                try {
                    const hasNewQuery = await checkForNewQueries();
                    if (hasNewQuery) {
                        console.log('Nueva consulta detectada, ejecutando...');
                        executeQuery();
                    }
                } catch (error) {
                    console.error('Error al verificar consultas:', error);
                }
            }, 2000);
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showError('Error al inicializar la aplicación: ' + error.message);
    }
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initApp);
