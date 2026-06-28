# ⚙️ Sistema POS e Inventario para Taller Mecánico

> **Aplicación Web Full Stack** desarrollada como proyecto independiente para practicar, consolidar conocimientos y resolver necesidades reales en la gestión de talleres mecánicos: control de productos, ventas, inventario, cálculo automatizado de precios y manejo de imágenes.

El objetivo principal de este proyecto fue construir una solución robusta y funcional utilizando **React, Node.js, Express y PostgreSQL**, aplicando buenas prácticas de arquitectura de software, conexión *frontend-backend* y manipulación eficiente de datos relacionales.

---

## 🛑 Problema que busca resolver

En talleres mecánicos pequeños y refaccionarias, el control de inventario suele volverse complejo debido a la naturaleza de los artículos. No todos los productos se comercializan de la misma forma: mientras algunos se venden estrictamente **por pieza**, muchos otros requieren manejarse mediante **cantidades fraccionadas** (por ejemplo: *litros* de aceite, *metros* de manguera o unidades parciales).

Este proyecto propone una solución centralizada para registrar productos, consultar existencias en tiempo real, procesar ventas eficientemente y, de manera crucial, **conservar información histórica importante** sin eliminar registros de forma definitiva de la base de datos.

---

## ✨ Funcionalidades Principales

* 📦 **Administración Total:** Registro, edición y control detallado de productos.
* ⚖️ **Inventario Flexible:** Gestión adaptada tanto para productos por pieza como para bienes *fraccionables*.
* 🔍 **Búsqueda Avanzada:** Motor de búsqueda integrado directamente desde la interfaz de usuario.
* 📑 **Paginación Server-Side:** Optimización del lado del servidor para manejar catálogos de gran escala (probado con éxito en entornos de **más de 5,000 registros**).
* 📊 **Módulo Financiero:** Cálculo automático de precios sugeridos al público considerando costos de adquisición y márgenes de utilidad deseados.
* 🖼️ **Gestión Multimedia:** Carga, almacenamiento y renderizado ágil de imágenes mediante *Cloudinary*.
* 🧹 **Mantenimiento Automático:** Limpieza automática de imágenes no utilizadas en la nube para reducir el consumo innecesario de almacenamiento.
* 🛡️ **Persistencia Segura:** Implementación de *Soft Deletes* (borrado lógico) para desactivar registros manteniendo intacto el historial de transacciones.

---

## 🛠️ Tecnologías Utilizadas

### 🎨 Frontend
* `React` *(Biblioteca principal para la interfaz de usuario)*
* `Vite` *(Herramienta de construcción y entorno de desarrollo ultra rápido)*
* `Tailwind CSS` *(Framework para estilos modernos, limpios y responsivos)*
* `React Router DOM` *(Gestión de rutas y navegación SPA)*
* `Sonner` *(Notificaciones emergentes/toasts elegantes y fluidas)*

### ⚙️ Backend
* `Node.js` *(Entorno de ejecución de JavaScript en el servidor)*
* `Express.js` *(Framework para la creación de la infraestructura de la API)*
* `API REST` *(Arquitectura limpia para la comunicación y transferencia de datos)*

### 🗄️ Base de Datos
* `PostgreSQL` *(Sistema de gestión de base de datos relacional)*
* `SQL` *(Lenguaje de consultas estructuradas)*
* *Tipos numéricos precisos* para el manejo exacto de precios financieros y cantidades fraccionales.

### ☁️ Servicios Externos
* `Cloudinary` *(Plataforma en la nube para el almacenamiento y optimización de imágenes de productos)*

---

## 🧠 Decisiones Técnicas

* 📑 **Paginación del lado del Servidor (*Server-side Pagination*):** La búsqueda y la carga de datos se delegan completamente al backend para evitar saturar la memoria del navegador. Esto garantiza que la aplicación mantenga una interfaz ligera, fluida y con tiempos de respuesta óptimos incluso con miles de registros en inventario.
* 💧 **Productos Fraccionables:** Se diseñó la lógica de datos contemplando la distinción entre unidades enteras y parciales, permitiendo representar con precisión los escenarios del día a día en un entorno de refaccionaria o taller mecánico.
* 🛡️ **Borrado Lógico (*Soft Deletes*):** En lugar de aplicar un `DELETE` directo en las tablas, los registros se marcan con una bandera de inactividad. Esto protege la integridad referencial de las ventas realizadas y permite auditorías o recuperaciones de información histórica crítica.
* 🧹 **Gestión y Optimización de Almacenamiento:** Para evitar el "bloat" de archivos en *Cloudinary*, el sistema detecta de forma automatizada cuándo una imagen ya no está asociada a un producto activo y procede a su eliminación remota mediante la API del servicio.

---

## ⚙️ Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu entorno local:

1. Clona el repositorio:
git clone https://github.com/UrielRL1144/taller-mecanico-V1.1.git
2. Instala las dependencias del Servidor:
cd backend
npm install

3. Configura tus variables de entorno en el backend (`.env`):
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taller_db

4. Instala las dependencias del Cliente:
cd ../frontend
npm install

5. Inicia ambos servidores:
# En la terminal del backend
npm run dev

# En la terminal del frontend
npm run dev

## 🧠 Decisiones de Arquitectura 

* **Ingeniería de Datos:** Se migró de tipos `INTEGER` a `DECIMAL(10, 2)` en PostgreSQL para soportar la venta fraccionaria sin errores de redondeo de punto flotante en JavaScript.
* **Optimización de Red:** Se implementó el patrón *Thumbnail/Preview* solicitando transformaciones al vuelo a Cloudinary (`w_150`, `w_1200`), reduciendo drásticamente el peso de descarga del catálogo.
* **Gestión de Memoria en UI:** Se sustituyó el filtrado local por consultas paginadas (`LIMIT` / `OFFSET`) al servidor, previniendo cuellos de botella en el navegador cuando el inventario supera los miles de registros.

## 📊 Estado del Proyecto

> 🟢 **Proyecto funcional en fase de desarrollo continuo y optimización.** > Esta solución fue creada originalmente como una práctica *Full Stack* intensiva, orientada a resolver una necesidad operativa y real de un negocio local.

---

## 🎓 Aprendizajes Clave

* 🔌 **Integración End-to-End:** Conexión eficiente y segura de interfaces dinámicas en `React` con una `API REST` robusta construida en `Node.js` y `Express`.
* 📐 **Diseño de Bases de Datos:** Modelado y estructuración de arquitecturas relacionales en `PostgreSQL` para gestionar con precisión la lógica de productos, transacciones de ventas e inventarios dinámicos.
* 🏎️ **Optimización de Rendimiento:** Implementación de técnicas avanzadas de *paginación* y *filtrado* desde el lado del servidor (*Server-side*) para asegurar una respuesta ágil ante grandes volúmenes de información.
* ☁️ **Consumo de APIs de Terceros:** Control programático y automatizado del ciclo de vida de archivos multimedia mediante la integración del SDK de `Cloudinary`.
* 📁 **Estructura de Proyecto Profesional:** Organización limpia de repositorios *Full Stack*, manteniendo una estricta separación de responsabilidades (*Clean Architecture*) entre el *frontend*, *backend* y la documentación técnica.

## 👨‍💻 Autor

**Uriel Ramos Lucio**

Desarrollado de forma independiente por Uriel Ramos Lucio, con un enfoque centrado en la creación de herramientas de software aplicadas a la automatización administrativa de talleres mecánicos y gestión de inventarios.
