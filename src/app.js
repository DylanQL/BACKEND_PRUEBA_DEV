const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar middleware y rutas
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { morganConfig, requestLogger } = require('./middleware/logger');
const database = require('./config/database');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Configuración de middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
    crossOriginEmbedderPolicy: false
}));

// Configuración de CORS
app.use(cors({
    origin: true, // Permitir acceso desde cualquier origen
    credentials: true,
    optionsSuccessStatus: 200
}));

// Configuración de parsers
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(morganConfig);
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 API REST - Gestión de Productos y Carrito de Compras',
        version: '1.0.0',
        author: 'GitHub Copilot',
        endpoints: {
            api: API_PREFIX,
            documentation: '/api/v1',
            health: '/api/v1/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Configurar rutas de la API
app.use(API_PREFIX, routes);

// Middleware de manejo de rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Función para inicializar la aplicación
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        console.log('🔌 Conectando a la base de datos...');
        await database.connect();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 SERVIDOR INICIADO EXITOSAMENTE');
            console.log('='.repeat(50));
            console.log(`📍 Puerto: ${PORT}`);
            console.log(`🌐 URL Local: http://localhost:${PORT}`);
            console.log(`📡 API Base: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`📚 Documentación: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`❤️  Health Check: http://localhost:${PORT}${API_PREFIX}/health`);
            console.log(`🗃️  Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        console.error('🔍 Verifique la configuración de la base de datos en el archivo .env');
        process.exit(1);
    }
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rechazada no manejada:', reason);
    process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('📴 Recibida señal SIGTERM. Cerrando servidor...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n📴 Recibida señal SIGINT. Cerrando servidor...');
    await database.disconnect();
    process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
