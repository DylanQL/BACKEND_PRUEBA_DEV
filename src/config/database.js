const sql = require('mssql');
require('dotenv').config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars);
    throw new Error(`Variables de entorno requeridas faltantes: ${missingVars.join(', ')}`);
}

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true, // Para desarrollo local
        enableArithAbort: true,
        requestTimeout: 30000,
        connectionTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000
    }
};

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            if (!this.pool) {
                console.log('🔌 Intentando conectar a SQL Server...');
                console.log(`📍 Servidor: ${config.server}`);
                console.log(`📊 Base de datos: ${config.database}`);
                console.log(`👤 Usuario: ${config.user}`);
                console.log(`🚪 Puerto: ${config.port}`);
                
                this.pool = await sql.connect(config);
                console.log('✅ Conexión a SQL Server establecida exitosamente');
            }
            return this.pool;
        } catch (error) {
            console.error('❌ Error conectando a la base de datos:');
            console.error('📋 Detalles del error:', error.message);
            
            if (error.code) {
                console.error('🔧 Código de error:', error.code);
            }
            
            // Sugerencias basadas en el tipo de error
            if (error.message.includes('login failed')) {
                console.error('💡 Verifique las credenciales de la base de datos (usuario/contraseña)');
            } else if (error.message.includes('server was not found')) {
                console.error('💡 Verifique la dirección del servidor y el puerto');
            } else if (error.message.includes('timeout')) {
                console.error('💡 Problema de conectividad - verifique la red y firewall');
            }
            
            throw new Error(`Error de conexión: ${error.message}`);
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                this.pool = null;
                console.log('🔌 Conexión a la base de datos cerrada');
            }
        } catch (error) {
            console.error('❌ Error cerrando la conexión:', error);
        }
    }

    async executeQuery(query, params = {}) {
        try {
            const pool = await this.connect();
            const request = pool.request();
            
            // Añadir parámetros si existen
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });

            const result = await request.query(query);
            return result;
        } catch (error) {
            console.error('❌ Error ejecutando query:', error);
            throw error;
        }
    }

    async executeProcedure(procedureName, params = {}) {
        try {
            const pool = await this.connect();
            const request = pool.request();
            
            // Añadir parámetros si existen
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });

            const result = await request.execute(procedureName);
            return result;
        } catch (error) {
            console.error('❌ Error ejecutando procedimiento:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const pool = await this.connect();
            const result = await pool.request().query('SELECT 1 as test');
            console.log('✅ Test de conexión exitoso');
            return true;
        } catch (error) {
            console.error('❌ Test de conexión falló:', error.message);
            return false;
        }
    }
}

module.exports = new Database();
