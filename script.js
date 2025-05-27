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
        
        values.forEach(row => {
            const tr = document.createElement('tr');
            
            row.forEach(cell => {
                const td = document.createElement('td');
                
                // Formatear fechas
                if (cell && typeof cell === 'string' && cell.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const date = new Date(cell);
                    td.textContent = date.toLocaleDateString('es-ES');
                } else {
                    td.textContent = cell !== null ? cell : 'NULL';
                }
                
                // Resaltar valores booleanos
                if (cell === 1 || cell === 0) {
                    td.textContent = cell ? 'Sí' : 'No';
                    td.classList.add('text-center');
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

// Inicializar la aplicación
async function initApp() {
    // Inicializar el editor de código
    initCodeEditor();
    
    // Inicializar la base de datos
    const dbInitialized = await initDatabase();
    
    if (dbInitialized) {
        // Ejecutar consulta por defecto
        executeQuery();
        
        // Configurar eventos
        document.getElementById('executeQuery').addEventListener('click', executeQuery);
        document.getElementById('clearQuery').addEventListener('click', clearEditor);
    }
}

// Iniciar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initApp);
