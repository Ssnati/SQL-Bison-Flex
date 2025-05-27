// Datos de ejemplo
const sampleData = [
    { id: 1, description: 'Análisis de datos completado', date: '2023-05-26', status: 'completed' },
    { id: 2, description: 'Procesamiento de imágenes', date: '2023-05-25', status: 'completed' },
    { id: 3, description: 'Entrenamiento del modelo', date: '2023-05-24', status: 'pending' },
    { id: 4, description: 'Extracción de características', date: '2023-05-23', status: 'completed' },
    { id: 5, description: 'Limpieza de datos', date: '2023-05-22', status: 'failed' },
    { id: 6, description: 'Recolección de datos', date: '2023-05-21', status: 'completed' },
    { id: 7, description: 'Configuración inicial', date: '2023-05-20', status: 'completed' },
    { id: 8, description: 'Pruebas de rendimiento', date: '2023-05-19', status: 'pending' },
    { id: 9, description: 'Optimización de consultas', date: '2023-05-18', status: 'completed' },
    { id: 10, description: 'Documentación técnica', date: '2023-05-17', status: 'pending' }
];

// Variables de paginación
let currentPage = 1;
const itemsPerPage = 5;

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para obtener la clase CSS según el estado
function getStatusClass(status) {
    switch(status) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        case 'failed': return 'status-failed';
        default: return '';
    }
}

// Función para traducir el estado
function translateStatus(status) {
    const statusMap = {
        'completed': 'Completado',
        'pending': 'Pendiente',
        'failed': 'Fallido'
    };
    return statusMap[status] || status;
}

// Función para renderizar la tabla
function renderTable(page) {
    const tbody = document.getElementById('resultsTable');
    tbody.innerHTML = '';
    
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = sampleData.slice(start, end);
    
    if (paginatedItems.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4" class="text-center py-4">No hay registros para mostrar</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    paginatedItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.description}</td>
            <td>${formatDate(item.date)}</td>
            <td><span class="status-badge ${getStatusClass(item.status)}">${translateStatus(item.status)}</span></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Actualizar información de paginación
    document.getElementById('pageInfo').textContent = `Página ${page} de ${Math.ceil(sampleData.length / itemsPerPage)}`;
    
    // Habilitar/deshabilitar botones según corresponda
    document.getElementById('prevBtn').disabled = page === 1;
    document.getElementById('nextBtn').disabled = end >= sampleData.length;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderTable(currentPage);
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if ((currentPage * itemsPerPage) < sampleData.length) {
            currentPage++;
            renderTable(currentPage);
        }
    });
});

// Función para simular búsqueda (puedes implementar la lógica real aquí)
function searchResults(query) {
    console.log('Buscando:', query);
    // Implementar lógica de búsqueda si es necesario
}
