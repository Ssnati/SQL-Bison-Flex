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

        document.getElementById('toggleHistory').addEventListener('click', async () => {
            try {
                console.log('Botón de historial clickeado. Estado actual:', isHistoryVisible ? 'visible' : 'oculto');
                const historyContainer = document.querySelector('.history-container');
                if (!historyContainer) {
                    console.error('No se encontró el contenedor del historial');
                    throw new Error('No se encontró el contenedor del historial');
                }
                
                if (isHistoryVisible) {
                    console.log('Ocultando historial');
                    historyContainer.classList.remove('visible');
                    document.getElementById('toggleHistory').innerHTML = '<i class="bi bi-clock-history me-1"></i> Mostrar historial';
                } else {
                    console.log('Mostrando historial');
                    // Cargar el historial antes de mostrarlo
                    await loadQueriesHistory();
                    console.log('Historial cargado, actualizando vista');
                    updateQueriesHistory();
                    historyContainer.classList.add('visible');
                    document.getElementById('toggleHistory').innerHTML = '<i class="bi bi-clock-history me-1"></i> Ocultar historial';
                }
                isHistoryVisible = !isHistoryVisible;
                console.log('Nuevo estado del historial:', isHistoryVisible ? 'visible' : 'oculto');
            } catch (error) {
                console.error('Error al alternar el historial:', error);
                showError('Error al cargar el historial');
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

// Función para actualizar la visualización del historial de consultas
function updateQueriesHistory() {
    console.log('Actualizando vista del historial. Número de consultas:', queriesHistory.length);
    const historyList = document.getElementById('queriesHistory');
    if (!historyList) {
        console.error('No se encontró el elemento con ID queriesHistory');
        return;
    }

    if (queriesHistory.length === 0) {
        console.log('No hay consultas en el historial, mostrando mensaje');
        historyList.innerHTML = `
            <li class="list-group-item text-muted text-center py-4">
                <i class="bi bi-clock-history d-block mb-2" style="font-size: 2rem;"></i>
                No hay consultas en el historial
            </li>`;
        return;
    }

    try {
        // Ordenar de más reciente a más antiguo
        const sortedQueries = [...queriesHistory].reverse();
        
        console.log('Generando HTML para las consultas...');
        historyList.innerHTML = sortedQueries.map((query, index) => {
            const safeQuery = query ? query.replace(/"/g, '&quot;')
                                   .replace(/</g, '&lt;')
                                   .replace(/>/g, '&gt;') : '';
            const displayText = query || 'Consulta vacía';
            const timestamp = new Date().toLocaleTimeString();
            
            return `
            <li class="list-group-item query-item" data-query="${safeQuery}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="query-text">${displayText}</div>
                    <div class="d-flex flex-column align-items-end">
                        <small class="text-muted mb-1">${timestamp}</small>
                        <button class="btn btn-sm btn-outline-primary use-query" title="Usar esta consulta">
                            <i class="bi bi-arrow-return-left"></i>
                        </button>
                    </div>
                </div>
            </li>`;
        }).join('');

        console.log('HTML generado, agregando manejadores de eventos...');
        // Agregar manejadores de eventos a los botones de usar consulta
        document.querySelectorAll('.use-query').forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const queryItem = e.target.closest('.query-item');
                if (!queryItem) {
                    console.error('No se pudo encontrar el elemento padre query-item');
                    return;
                }
                const query = queryItem.getAttribute('data-query');
                console.log('Cargando consulta en el editor:', query);
                editor.setValue(query);
                // Desplazar el editor a la vista
                const codeMirror = document.querySelector('.CodeMirror');
                if (codeMirror) {
                    codeMirror.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        console.log('Vista del historial actualizada correctamente');
    } catch (error) {
        console.error('Error al actualizar la vista del historial:', error);
        historyList.innerHTML = `
            <li class="list-group-item text-danger text-center py-4">
                <i class="bi bi-exclamation-triangle d-block mb-2" style="font-size: 2rem;"></i>
                Error al cargar el historial
            </li>`;
    }
}

// Función para cargar el historial de consultas
async function loadQueriesHistory() {
    try {
        console.log('Iniciando carga del historial de consultas...');
        updateFileStatus('Cargando historial...', 'info');
        
        console.log('Realizando petición a /api/queries...');
        const response = await fetch('/api/queries');
        console.log('Respuesta recibida. Estado:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = 'Error al cargar el historial';
            try {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                console.error('No se pudo procesar la respuesta de error:', e);
            }
            throw new Error(errorMessage);
        }
        
        console.log('Procesando datos de la respuesta...');
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Asegurarse de que data.queries es un array
        // El servidor devuelve { queries: [...] } pero también manejamos el caso directo
        const queriesArray = Array.isArray(data.queries) ? data.queries : 
                           (Array.isArray(data) ? data : []);
        queriesHistory = queriesArray;
        console.log(`Se cargaron ${queriesHistory.length} consultas en el historial`);
        
        // Actualizar el contador en la interfaz
        const queryCountElement = document.getElementById('queryCount');
        if (queryCountElement) {
            queryCountElement.textContent = queriesHistory.length;
        } else {
            console.warn('No se encontró el elemento queryCount');
        }
        
        if (queriesHistory.length > 0) {
            currentQuery = queriesHistory[queriesHistory.length - 1];
            console.log('Consulta actual establecida:', currentQuery);
            if (editor) {
                editor.setValue(currentQuery);
            } else {
                console.warn('El editor no está inicializado');
            }
            updateFileStatus('Historial cargado', 'success');
        } else {
            console.log('No hay consultas en el historial');
            updateFileStatus('No hay consultas en el historial', 'info');
        }
        
        return queriesHistory;
    } catch (error) {
        console.error('Error en loadQueriesHistory:', error);
        updateFileStatus('Error al cargar el historial: ' + error.message, 'danger');
        throw error; // Relanzar el error para que lo maneje el llamador
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
