-- Insertar datos de ejemplo en la tabla de usuarios
INSERT INTO usuarios (nombre_usuario, nombre, apellido) VALUES
('jperez', 'juan', 'perez'),
('mgarcia01', 'maria', 'garcia'),
('clopez', 'carlos', 'lopez'),
('amartinez', 'ana', 'martinez'),
('psanchez', 'pedro', 'sanchez');

-- Insertar datos de ejemplo en la tabla de productos
INSERT INTO productos (nombre_producto, categoria, stock) VALUES
('laptop', 'electronica', 15),
('smartphone', 'electronica', 30),
('tablet', 'electronica', 45),
('monitor', 'electronica', 25),
('teclado', 'perifericos', 50),
('mouse', 'perifericos', 75),
('disco_duro', 'almacenamiento', 40),
('auriculares', 'audio', 35);

-- Insertar datos de ejemplo en la tabla de pedidos
INSERT INTO pedidos (id_usuario, id_producto, cantidad) VALUES
(1, 2, 1),
(1, 5, 1),
(2, 1, 1),
(3, 3, 1),
(3, 6, 1),
(4, 7, 1),
(5, 4, 1),
(5, 8, 1),
(2, 2, 1),
(1, 3, 1);
