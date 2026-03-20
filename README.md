# ⚙️ AutoStock Pro: Sistema Integral de POS e Inventario

Un sistema de Punto de Venta (POS) y Gestión de Inventario Full-Stack de alto rendimiento, diseñado específicamente para resolver los desafíos logísticos de talleres mecánicos y refaccionarias.

Este proyecto aplica principios de ingeniería de software para gestionar inventarios complejos, cálculos financieros en tiempo real y ventas de mostrador ágiles.

## 🚀 El Problema que Resuelve

Los sistemas de inventario tradicionales asumen que todo se vende por piezas enteras. En el sector automotriz e industrial, el inventario es híbrido: se venden refacciones enteras (bujías, balatas) y material a granel o fraccionable (metros de cable, litros de aceite). 

AutoStock Pro resuelve esto con un motor de base de datos preparado para matemáticas continuas, combinando una interfaz de usuario optimizada para la velocidad del mostrador con un backend capaz de manejar catálogos de miles de productos sin pérdida de rendimiento.

## 🛠️ Características Principales

* **Motor de Inventario Híbrido:** Lógica estricta que distingue entre unidades discretas (Piezas/Kits) y continuas (Metros/Litros). Incluye prevención de errores en la interfaz para evitar ventas fraccionadas inválidas.
* **Punto de Venta (POS) "Dark Mode":** Interfaz de alto contraste diseñada para ambientes operativos y talleres. Incluye un carrito inteligente con edición manual de fracciones y validación de stock en tiempo real.
* **Paginación Dinámica del Lado del Servidor:** Capacidad para manejar catálogos masivos. El frontend renderiza bloques de 50 en 50, delegando la carga de búsqueda y filtrado a PostgreSQL para mantener el DOM ligero (O(1) rendering constraints).
* **Motor Financiero de Reabastecimiento:** Calculadora integrada que toma el costo de compra, aplica márgenes de ganancia deseados y sugiere precios de venta finales, mostrando la rentabilidad neta proyectada.
* **Gestión Multimedia en la Nube:** Integración con Cloudinary para múltiples fotos por producto y facturas. Incluye un algoritmo de *Garbage Collection* en el frontend que detecta cargas abortadas y elimina imágenes huérfanas mediante tokens, ahorrando almacenamiento.
* **Ciclo de Vida de Datos (Soft Delete):** Los productos con historial financiero no se eliminan físicamente (Hard Delete), sino que se archivan, garantizando la integridad referencial y la contabilidad histórica.

## 💻 Stack Tecnológico

**Frontend:**
* React (Vite)
* Tailwind CSS (Estilos responsivos y Dark Mode)
* Sonner (Notificaciones Toast no bloqueantes)
* React Router DOM (Navegación)

**Backend & Base de Datos:**
* Node.js / Express.js (API RESTful)
* PostgreSQL (Base de datos relacional con `DECIMAL(10,2)` y soporte JSONB)
* Node-Postgres (`pg` pool para conexiones concurrentes)

**Servicios Externos:**
* Cloudinary API (Almacenamiento optimizado y transformación de imágenes al vuelo).

## ⚙️ Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu entorno local:

1. Clona el repositorio:
git clone https://github.com/TuUsuario/autostock-pro.git

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

## 🧠 Decisiones de Arquitectura (Para Reclutadores)

* **Ingeniería de Datos:** Se migró de tipos `INTEGER` a `DECIMAL(10, 2)` en PostgreSQL para soportar la venta fraccionaria sin errores de redondeo de punto flotante en JavaScript.
* **Optimización de Red:** Se implementó el patrón *Thumbnail/Preview* solicitando transformaciones al vuelo a Cloudinary (`w_150`, `w_1200`), reduciendo drásticamente el peso de descarga del catálogo.
* **Gestión de Memoria en UI:** Se sustituyó el filtrado local por consultas paginadas (`LIMIT` / `OFFSET`) al servidor, previniendo cuellos de botella en el navegador cuando el inventario supera los miles de registros.

## 👨‍💻 Autor

Diseñado y desarrollado combinando conocimientos de ingeniería informática aplicada a la gestión automotriz.

* **GitHub:** [@TuUsuario](https://github.com/UrielRL1144/taller-mecanico-V1.1.git)
* **LinkedIn:** [Tu Nombre](www.linkedin.com/in/uriel-ramos-lucio)
