// Conexión con PostgreSQL (Supabase)
var { Pool } = require("pg");

var pool = new Pool({
    connectionString: process.env.DATABASE_URL,   // la URL del .env
    ssl: { rejectUnauthorized: false }            // Supabase exige conexión cifrada (SSL)
});

// Al arrancar, comprobamos que la conexión funciona
pool.query("SELECT 1", function (err) {
    if (err) {
        console.error("Error en la conexión de la base de datos:", err.message);
    } else {
        console.log("Conectado a la base de datos de Supabase");
    }
});

// ADAPTADOR: imita conexion.query() de mysql para no tener que cambiar las rutas
function query(sql, params, callback) {
    // Permite llamar a query(sql, callback) sin parámetros, igual que con mysql
    if (typeof params === "function") {
        callback = params;
        params = [];
    }

    // 1. MySQL usa ? y PostgreSQL usa $1, $2, $3...
    var contador = 0;
    var sqlPg = sql.replace(/\?/g, function () {
        contador++;
        return "$" + contador;
    });

    // 2. Con mysql, el INSERT devuelve insertId. En PostgreSQL hay que pedirlo con RETURNING
    var esInsert = sql.trim().toUpperCase().startsWith("INSERT");
    if (esInsert) {
        sqlPg += " RETURNING *";
    }

    pool.query(sqlPg, params, function (err, resultado) {
        if (err) return callback(err);

        // 3. Devolvemos lo mismo que devolvía mysql
        var filas = resultado.rows;                 // las filas (SELECT)
        filas.affectedRows = resultado.rowCount;    // filas afectadas (UPDATE, DELETE)
        if (esInsert && filas.length > 0) {
            filas.insertId = filas[0].id;           // id del registro creado (INSERT)
        }
        callback(null, filas);
    });
}

module.exports = { query: query };