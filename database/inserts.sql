-- Insertar datos de ejemplo en la tabla de usuarios
INSERT INTO usuarios (nombre_usuario, email) VALUES
('Juan Pérez', 'juan.perez@example.com'),
('María García', 'maria.garcia@example.com'),
('Carlos López', 'carlos.lopez@example.com'),
('Ana Martínez', 'ana.martinez@example.com'),
('Pedro Sánchez', 'pedro.sanchez@example.com');

-- Insertar datos de ejemplo en la tabla de productos
INSERT INTO productos (nombre_producto, precio, stock) VALUES
('Laptop HP EliteBook', 1299.99, 15),
('Smartphone Samsung Galaxy S21', 899.99, 30),
('Tablet Amazon Fire HD', 149.99, 45),
('Monitor LG 24"', 199.99, 25),
('Teclado Mecánico RGB', 79.99, 50),
('Mouse Inalámbrico', 29.99, 75),
('Disco Duro Externo 1TB', 69.99, 40),
('Auriculares Bluetooth', 59.99, 35);

-- Insertar datos de ejemplo en la tabla de pedidos
-- Nota: Los IDs de usuario y producto deben existir en sus respectivas tablas
INSERT INTO pedidos (id_usuario, id_producto, total, fecha_pedido) VALUES
(1, 2, 899.99, '2025-05-01 10:30:00'),
(1, 5, 79.99, '2025-05-01 10:30:00'),
(2, 1, 1299.99, '2025-05-02 14:15:00'),
(3, 3, 149.99, '2025-05-03 09:45:00'),
(3, 6, 29.99, '2025-05-03 09:45:00'),
(4, 7, 69.99, '2025-05-04 16:20:00'),
(5, 4, 199.99, '2025-05-05 11:10:00'),
(5, 8, 59.99, '2025-05-05 11:10:00'),
(2, 2, 899.99, '2025-05-06 13:25:00'),
(1, 3, 149.99, '2025-05-07 15:40:00');
