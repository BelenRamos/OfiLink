const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=OfiLinkDB;Trusted_Connection=Yes;TrustServerCertificate=Yes;',
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server con autenticación de Windows (y certificado confiado)');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a SQL Server:', err);
  });

module.exports = { sql, poolPromise };
