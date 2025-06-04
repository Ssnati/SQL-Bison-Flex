-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY,
    nombre_usuario TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id_producto INTEGER PRIMARY KEY,
    nombre_producto TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INTEGER PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    total REAL NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
