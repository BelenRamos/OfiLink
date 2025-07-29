const sql = require('mssql');

//Configuration manager --> SQLServerManager16.msc
const config = {
  user: 'admin',
  password: '2025',
  server: 'localhost', 
  database: 'OfiLinkDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    port: 1433 
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server con mssql');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a SQL Server:', err);
  });

module.exports = { sql, poolPromise };
