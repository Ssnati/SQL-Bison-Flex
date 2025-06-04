// Variables globales
let editor;
let isHistoryVisible = false;
let lastQueryTime = 0;

// Configuración del editor
const editorOptions = {
    mode: 'text/x-sql',
    theme: 'dracula',
    lineNumbers: true,
    autofocus: true,
    tabSize: 4,
    indentUnit: 4,
    extraKeys: { 'Ctrl-Space': 'autocomplete' }
};

// URLs del backend
const API_URL = '/api/queries';

// Inicializar el editor SQL
async function initEditor() {
    try {
        editor = CodeMirror.fromTextArea(document.getElementById('sqlQuery'), editorOptions);
        await loadQueriesHistory();
        updateFileStatus('Listo', 'success');

        // Añadir event listeners para los botones
        document.getElementById('executeQuery').addEventListener('click', async () => {
            try {
                await executeCurrentQuery();
            } catch (error) {
                console.error('Error al ejecutar consulta:', error);
                showError('Error al ejecutar la consulta');
            }
        });

        document.getElementById('toggleHistory').addEventListener('click', () => {
            try {
                const historyContainer = document.querySelector('.history-container');
                if (!historyContainer) throw new Error('No se encontró el contenedor del historial');
                
                if (isHistoryVisible) {
                    historyContainer.style.display = 'none';
                    document.getElementById('toggleHistory').textContent = 'Mostrar historial';
                } else {
                    historyContainer.style.display = 'block';
                    document.getElementById('toggleHistory').textContent = 'Ocultar historial';
                }
                isHistoryVisible = !isHistoryVisible;
            } catch (error) {
                console.error('Error al alternar el historial:', error);
                showError('Error al alternar el historial');
            }
        });

        // Configurar el modal de confirmación para limpiar el historial
        const clearHistoryBtn = document.getElementById('clearHistory');
        const confirmClearBtn = document.getElementById('confirmClearBtn');
        const clearModal = new bootstrap.Modal(document.getElementById('confirmClearModal'));
        
        clearHistoryBtn.addEventListener('click', () => {
            clearModal.show();
        });

        confirmClearBtn.addEventListener('click', async () => {
            try {
                clearModal.hide();
                updateFileStatus('Limpiando historial...', 'info');
                
                const response = await fetch('/api/queries', {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Error al limpiar el historial');
                }
                
                // Limpiar el historial local
                queriesHistory = [];
                updateFileStatus(result.message || 'Historial limpiado', 'success');
            } catch (error) {
                console.error('Error al limpiar el historial:', error);
                updateFileStatus('Error al limpiar el historial', 'danger');
            }
        });
    } catch (error) {
        console.error('Error al inicializar el editor:', error);
        showError('Error al inicializar el editor');
    }
}

// Ejecutar consulta SQL
async function executeQuery() {
    const query = editor.getValue().trim();
    if (!query) {
        showError('Por favor, ingrese una consulta SQL');
        return;
    }

    // Limpiar resultados anteriores
    document.getElementById('resultsTable').innerHTML = '';
    document.getElementById('resultsHeader').innerHTML = '';
    document.getElementById('noResults').classList.add('d-none');
    document.getElementById('errorMessage').classList.add('d-none');
    document.getElementById('queryInfo').classList.add('d-none');

    try {
        // Ejecutar consulta en el backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al ejecutar la consulta');
        }

        const data = await response.json();
        const results = data.results;

        // Mostrar resultados
        if (!results || results.length === 0) {
            showNoResults();
            return;
        }

        // Procesar resultados
        const columns = Object.keys(results[0]);
        const values = results;

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

            columns.forEach(column => {
                const td = document.createElement('td');
                const value = row[column];

                // Formatear fechas
                if (value !== null && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const date = new Date(value);
                    td.textContent = date.toLocaleDateString('es-ES');
                } 
                // Solo convertir a Sí/No si es una columna de estado o booleana
                else if ((column === 'status' || column.endsWith('_active') || column.endsWith('_status')) && (value === 1 || value === 0)) {
                    td.textContent = value ? 'Sí' : 'No';
                    td.classList.add('text-center');
                }
                // Para cualquier otro valor, incluyendo IDs
                else {
                    td.textContent = value !== null ? value : 'NULL';
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        // Mostrar información de la consulta
        showQueryInfo(`Consulta ejecutada correctamente. ${values.length} fila${values.length !== 1 ? 's' : ''} devuelta${values.length !== 1 ? 's' : ''}.`);

    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        showError('Error en la consulta: ' + error.message);
    }
}

// Inicializar la aplicación cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    initEditor();
});

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
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al cargar el historial');
        }
        
        const data = await response.json();
        queriesHistory = data.queries || [];
        
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
        updateFileStatus('Ejecutando consulta...', 'info');
        await executeQuery();
        updateFileStatus('Consulta ejecutada', 'success');
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        updateFileStatus('Error al ejecutar', 'danger');
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
