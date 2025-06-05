# Herramienta de Consultas SQL con Historial

## 📋 Descripción
Esta es una aplicación web que permite ejecutar consultas SQL en una base de datos SQLite y mantener un historial de las consultas realizadas. La aplicación incluye una interfaz intuitiva para escribir consultas, visualizar resultados y acceder al historial de consultas anteriores.

## 🚀 Características Principales
- Ejecución de consultas SQL en tiempo real
- Historial de consultas con capacidad de búsqueda
- Visualización de resultados en formato de tabla
- Interfaz de usuario intuitiva y responsiva
- Soporte para múltiples consultas en una sola ejecución
- Traducción de consultas SQL a lenguaje natural (inglés)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express**: Framework para aplicaciones web
- **SQLite3**: Base de datos relacional embebida
- **CORS**: Middleware para permitir solicitudes entre dominios

### Frontend
- **HTML5**: Estructura de la aplicación web
- **CSS3**: Estilos y diseño responsivo
- **JavaScript**: Funcionalidad del lado del cliente

## 📂 Estructura del Proyecto

```
├── database/
│   ├── creation.sql    # Scripts de creación de tablas
│   └── inserts.sql     # Datos iniciales
├── public/             # Archivos estáticos
├── node_modules/       # Dependencias de Node.js
├── index.html          # Página principal
├── script.js           # Lógica del cliente
├── server.js           # Servidor Node.js
├── styles.css          # Estilos CSS
├── package.json        # Configuración del proyecto
└── README.md           # Este archivo
```

## 🚀 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm (incluido con Node.js)
- Navegador web moderno (Chrome, Firefox, Edge, etc.)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Ssnati/SQL-Bison-Flex.git
   cd SQL-Bison-Flex
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con recarga automática)
   npm run dev
   
   # O para producción
   npm start
   ```

4. **Abrir la aplicación**
   Abre tu navegador y navega a:
   ```
   http://localhost:3000
   ```

## 🖥️ Uso

1. **Interfaz de Consulta**
   - Escribe tus consultas SQL en el área de texto principal
   - Haz clic en "Ejecutar Consulta" para ver los resultados

2. **Historial de Consultas**
   - Todas las consultas ejecutadas se guardan automáticamente
   - Haz clic en cualquier consulta anterior para volver a ejecutarla

3. **Resultados**
   - Los resultados se muestran en formato de tabla
   - Se muestra el número de filas afectadas
   - Los errores de sintaxis se muestran con mensajes descriptivos

## 🔧 Configuración

El archivo `server.js` contiene las configuraciones principales:

```javascript
const PORT = 3000;  // Puerto del servidor
const HOST = '0.0.0.0';  // Host del servidor
const QUERIES_FILE = 'queries.txt';  // Archivo para guardar el historial
```

## 📊 Base de Datos

La aplicación utiliza SQLite como base de datos. Los esquemas de las tablas se definen en `database/creation.sql` y los datos iniciales en `database/inserts.sql`.

### Estructura de la Base de Datos

La base de datos está compuesta por las siguientes tablas relacionadas:

#### Tabla: `usuarios`
- `id_usuario` (INTEGER, PRIMARY KEY): Identificador único del usuario
- `nombre_usuario` (TEXT): Nombre de usuario para inicio de sesión
- `nombre` (TEXT): Nombre real del usuario
- `apellido` (TEXT): Apellido del usuario

#### Tabla: `productos`
- `id_producto` (INTEGER, PRIMARY KEY): Identificador único del producto
- `nombre_producto` (TEXT): Nombre del producto
- `categoria` (TEXT): Categoría a la que pertenece el producto
- `stock` (INTEGER): Cantidad disponible en inventario

#### Tabla: `pedidos`
- `id_pedido` (INTEGER, PRIMARY KEY): Identificador único del pedido
- `id_usuario` (INTEGER, FOREIGN KEY): Referencia al usuario que realizó el pedido
- `id_producto` (INTEGER, FOREIGN KEY): Referencia al producto solicitado
- `cantidad` (INTEGER): Cantidad de unidades del producto

#### Relaciones
- Un usuario puede tener múltiples pedidos (relación uno a muchos con `pedidos`)
- Un producto puede estar en múltiples pedidos (relación uno a muchos con `pedidos`)ón


<div align="center">
  Hecho con ❤️ por Ssnati
</div>
