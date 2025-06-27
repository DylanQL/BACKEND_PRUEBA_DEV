const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);

    // Error de validación de SQL Server
    if (err.code === 'EREQUEST') {
        return res.status(400).json({
            success: false,
            message: 'Error en la consulta a la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error de validación'
        });
    }

    // Error de conexión a la base de datos
    if (err.code === 'ELOGIN' || err.code === 'ECONNRESET') {
        return res.status(503).json({
            success: false,
            message: 'Error de conexión a la base de datos',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Servicio no disponible'
        });
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'JSON malformado',
            error: 'Por favor verifica la sintaxis del JSON enviado'
        });
    }

    // Error personalizado
    if (err.isCustom) {
        return res.status(err.statusCode || 400).json({
            success: false,
            message: err.message,
            error: err.details || undefined
        });
    }

    // Error genérico del servidor
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        availableEndpoints: {
            products: '/api/v1/products',
            cart: '/api/v1/cart',
            health: '/api/v1/health'
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
