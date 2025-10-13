const sql = require('mssql');

const config = {
  user: 'admin',
  password: '2025',
  server: 'localhost',
  port: 1433,
  database: 'OfiLinkDB',
  requestTimeout: 30000,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        // Crear el pool de conexión una sola vez
        this.pool = new sql.ConnectionPool(config);
        
        // Conectar el pool y guardar la promesa
        this.poolPromise = this.pool.connect()
            .then(pool => {
                console.log('✅ Singleton: Conectado a SQL Server con mssql');
                return pool;
            })
            .catch(err => {
                console.error('❌ Singleton: Error al conectar a SQL Server:', err);
                throw err; // Es importante propagar el error
            });

        Database.instance = this;
    }

    // Método para obtener el pool de conexión (la Promesa ya conectada)
    getPool() {
        return this.poolPromise;
    }

    // Método estático para obtener la única instancia de la clase
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

// Exportar la instancia de Singleton
module.exports = {
    sql,
    poolPromise: Database.getInstance().getPool()
};