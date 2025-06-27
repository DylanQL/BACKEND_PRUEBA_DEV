const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true, // Para Azure
        trustServerCertificate: true // Para desarrollo local
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            if (!this.pool) {
                this.pool = await sql.connect(config);
                console.log('✅ Conexión a SQL Server establecida');
            }
            return this.pool;
        } catch (error) {
            console.error('❌ Error conectando a la base de datos:', error);
            throw error;
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
}

module.exports = new Database();
