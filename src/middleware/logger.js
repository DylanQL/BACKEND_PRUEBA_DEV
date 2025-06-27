const morgan = require('morgan');

// Configuración personalizada de Morgan para logs
const morganConfig = morgan((tokens, req, res) => {
    const logData = [
        '🌐',
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        '|',
        new Date().toISOString()
    ];

    // Colorear por código de estado
    const status = tokens.status(req, res);
    let colorCode = '';
    
    if (status >= 500) {
        colorCode = '\x1b[31m'; // Rojo para errores del servidor
    } else if (status >= 400) {
        colorCode = '\x1b[33m'; // Amarillo para errores del cliente
    } else if (status >= 300) {
        colorCode = '\x1b[36m'; // Cian para redirecciones
    } else {
        colorCode = '\x1b[32m'; // Verde para éxito
    }

    return colorCode + logData.join(' ') + '\x1b[0m';
});

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] Nueva solicitud: ${req.method} ${req.originalUrl}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('🔍 Query params:', req.query);
    }
    
    next();
};

module.exports = {
    morganConfig,
    requestLogger
};
