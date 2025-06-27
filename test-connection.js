const database = require('./src/config/database');

async function testDatabaseConnection() {
    console.log('🧪 Iniciando test de conexión a la base de datos...\n');
    
    try {
        // Mostrar configuración (sin mostrar la contraseña)
        console.log('📋 Configuración:');
        console.log(`   Servidor: ${process.env.DB_SERVER}`);
        console.log(`   Base de datos: ${process.env.DB_NAME}`);
        console.log(`   Usuario: ${process.env.DB_USER}`);
        console.log(`   Puerto: ${process.env.DB_PORT || '1433'}`);
        console.log('');

        // Intentar conectar
        const success = await database.testConnection();
        
        if (success) {
            console.log('🎉 ¡Conexión exitosa! La base de datos está funcionando correctamente.');
        } else {
            console.log('❌ La conexión falló. Revise la configuración.');
        }
        
        // Cerrar conexión
        await database.disconnect();
        
    } catch (error) {
        console.error('💥 Error durante el test:', error.message);
    }
    
    process.exit(0);
}

// Ejecutar test
testDatabaseConnection();
