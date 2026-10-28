*** Servidor API Backend

Implementa un servidor API Rest en node JS y express

con esta esta estructura

├── src/             # Contiene el código fuente principal de la aplicación
│   ├── controllers/ # Lógica para manejar las peticiones (controladores)
│   ├── models/      # Definiciones de datos (modelos)
│   ├── routes/      # Definiciones de las rutas de la API
│   ├── middlewares/ # Funciones que se ejecutan entre la petición y la respuesta
│   └── index.js     # Punto de entrada principal de la aplicación

** Base de datos
MySQL
usuario: root
password:
puerto:3306

** Tablas para genera APIs

genera rutas y controladores, metodos CRUD para las  siguientestablas

`usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

`productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL
)