require("dotenv").config();   // carga las variables del archivo .env
var express = require("express");
var app = express();

var conexion = require('./conexion.js');
var jwt = require("jsonwebtoken");
var SECRETO_JWT = process.env.JWT_SECRET || "clave_secreta_solo_para_local";

function verificarToken(req, res, next) {
    var cabecera = req.headers["authorization"];   
    if (!cabecera) {
        return res.status(401).json("Falta el token");
    }

    var token = cabecera.split(" ")[1];   // "Bearer " no es necesario

    jwt.verify(token, SECRETO_JWT, function (err, datos) { // compruebo que cuadra con SECRETO_JWT y que no está caducado
        if (err) {
            return res.status(401).json("Token no válido o caducado");
        }
        req.idGestor = datos.id;   
        next();                    
    });
}

app.use("/appCliente", express.static("cliente_rest")); 

// Si se entra a la dirección principal, redirigimos a la aplicación del gestor
app.get("/", function (req, res) {
    res.redirect("/appCliente/index_gestor.html");
});
app.use(express.json());

/*
Resumen códigos:
200: Éxito
201: recurso creado
400: solicitud incorrecta --> faltan datos o formato erróneo
403: login incorrecto
404: recurso no encontrado
res.send("msg") o res.json()--> para probar
*/

// Login para gestor
app.post("/api/gestores/login", function (req, res) { 
    console.log(req.body) // req.body --> métodos POST y PUT
    var login = req.body.login;
    var password = req.body.password;

   conexion.query(
    "SELECT * FROM gestores WHERE usuario = ? AND contra = ? ",
    [login,password],
        function(err,filas){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor"); 
            }
            if(filas.length>0){
                var token = jwt.sign(
                    { id: filas[0].id },      
                    SECRETO_JWT,              
                    { expiresIn: "1h" }       
                );
                res.status(200).json({ id: filas[0].id, token: token });
            } 
            else{
                res.status(403).json("Login incorrecto");
            }
        } 
   );
});

// Registro de un nuevo gestor
app.post("/api/gestores", function (req, res) {

    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var usuario = req.body.usuario;
    var password = req.body.password;

   conexion.query(
    "SELECT * FROM gestores WHERE usuario = ?",
    [usuario],
        function(err,existentes){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor"); 
            }
            if(existentes.length>0){
                return res.status(400).json("El nombre de usuario ya está pillado");
            } 
            conexion.query(
                "INSERT INTO gestores (nombre, apellidos, usuario, contra) VALUES (?, ?, ?, ?)",
                [nombre, apellidos, usuario, password],
                function(err, resultado){
                    if(err){
                        return res.status(500).json("Error del servidor");
                    }
                    res.status(201).json(resultado.insertId);
                }
            );
        } 
   );

});

// A partir de aquí, todas las rutas /api necesitan token pq Express recorre las rutas en el orden en que están escritas
app.use("/api", verificarToken);

// Obtener datos de un gestor 
app.get("/api/gestores/:id", function (req, res) {
    var idBusca = req.params.id; // Cogemos el ID 

    conexion.query(
        "SELECT id, nombre, apellidos, usuario FROM gestores where id= ?",
        [idBusca],
        function(err,busca){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor");
            }
            if(busca.length>0){
                res.status(200).json(busca[0]);
            }
            else{
                res.status(404).json("Gestor no encontrado"); 
            }
        }

    );
});

// Actualizar datos de un gestor existente
app.put("/api/gestores/:id", function (req, res) {
    var idBusca = req.params.id;
    conexion.query(
        "SELECT * FROM gestores WHERE id= ?",[idBusca], function(err, filas){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor");
            }
            if(filas.length===0){
                return res.status(404).json("Gestor no encontrado");
            }
            var contra; // COGEMOS LA CONTRASEÑA SI SE CAMBIA
            if (req.body.password) {
                contra = req.body.password;
            } else {
                contra = filas[0].contra;
            }

            conexion.query(
                "UPDATE gestores SET nombre= ?, apellidos= ?, usuario= ?, contra= ? WHERE id= ?",
                [req.body.nombre, req.body.apellidos, req.body.usuario, contra, idBusca], 
                function(err){
                    if(err){
                        console.log(err);
                        return res.status(500).json("Error del servidor");
                    }
                    console.log(req.body.nombre + " " + req.body.apellidos + " ha actualizado sus datos");
                    return res.status(200).json("Datos actualizados");
                }
            );
        }
    );
   
});



app.get("/api/ubicaciones", function (req, res) {
    conexion.query(
        "SELECT * FROM ubicaciones", function(err, filas){
            if(err){
                 console.log(err);
                    return res.status(500).json("Error del servidor");
            }
            res.status(200).json(filas); 
        }
    );
    
});

app.get("/api/categorias", function (req, res) {
    conexion.query(
        "SELECT * FROM categorias", function(err, filas){
            if(err){
                 console.log(err);
                    return res.status(500).json("Error del servidor");
            }
            res.status(200).json(filas); 
        }
    ); 
});

app.get("/api/modelos", function (req, res) {
    conexion.query(
        "SELECT * FROM modelos", function(err, filas){
            if(err){
                 console.log(err);
                    return res.status(500).json("Error del servidor");
            }
            res.status(200).json(filas); 
        }
    );
});

app.get("/api/sanitarios", function (req, res) {
    conexion.query(
        "SELECT * FROM sanitarios", function(err, filas){
            if(err){
                 console.log(err);
                    return res.status(500).json("Error del servidor");
            }
            res.status(200).json(filas); 
        }
    ); 
});

// Obtener recursos con filtros opcionales 
app.get("/api/recursos", function (req, res) {
    var cat = req.query.categoria; // req.query --> método GET para filtrar o buscar información
    var mod = req.query.modelo;
    var ubi = req.query.ubicacion;
    var est = req.query.estado;

    // "SELECT tecnicos.* FROM recursos JOIN modelos ON recursos.modelo = modelos.id JOIN tecnicos ON tecnicos.categoria = modelos.categoria WHERE recursos.id = ?"

    var sql = "SELECT recursos.* FROM recursos JOIN modelos ON recursos.modelo = modelos.id WHERE 1=1";
    var params = [];

    if (cat && cat !== "Todos") {
        sql += " AND modelos.categoria = ?";
        params.push(cat);
    }

    if (mod && mod !== "Todos") {
        sql += " AND recursos.modelo = ?";
        params.push(mod);
    }

    if (ubi && ubi !== "Todos") {
        sql += " AND recursos.ubicacion = ?";
        params.push(ubi);
    }

    if (est && est !== "Todos") {
        sql += " AND recursos.estado = ?";
        params.push(est);
    }

   conexion.query(sql, params, function (err, lista) {
        if (err) { console.error(err); return res.status(500).json("Error del servidor"); }
        res.status(200).json(lista);
    });
});


app.post("/api/recursos", function (req, res) {
    conexion.query(
        "INSERT into recursos (modelo, ubicacion, numero_serie, estado) VALUES (?, ?, ?, ?)",
        [req.body.modelo, req.body.ubicacion, req.body.numero_serie, req.body.estado],
        function(err, resultado){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor");
            }
            res.status(201).json({
                id: resultado.insertId, // Por el autoincremento
                modelo: req.body.modelo,
                ubicacion: req.body.ubicacion,
                numero_serie: req.body.numero_serie,
                estado: req.body.estado
            });
        }
    );

});

app.delete("/api/recursos/:id", function (req, res) {
    conexion.query(
        "DELETE FROM recursos where id= ?", [req.params.id],
        function(err, resultado){
            if(err){
                if(err.code === "23503"){   // clave ajena: hay reservas/reseñas asociadas
                    return res.status(400).json("No se puede eliminar: el recurso tiene reservas o reseñas asociadas");
                }
                console.error(err); return res.status(500).json("Error del servidor");
            }
            if(resultado.affectedRows>0){
                 res.status(200).json("Recurso eliminado correctamente");
            } else{
                res.status(404).json("No se ha encontrado el recurso con ID: " + req.params.id);
            }
        }
    );

});

app.put("/api/recursos/:id", function(req, res){
    conexion.query(
        "UPDATE recursos SET modelo = ?, ubicacion = ?, numero_serie = ?, estado = ? WHERE id = ?",
        [req.body.modelo, req.body.ubicacion, req.body.numero_serie, req.body.estado, req.params.id],
        function(err, resultado){
            if(err){
                console.error(err); return res.status(500).json("Error del servidor");
            }
            if(resultado.affectedRows>0){
                 res.status(200).json("Recurso actualizado correctamente");
            } else{
                res.status(404).json("No se ha encontrado el recurso con ID: " + req.params.id);
            }
        }
    );

});

//Reservas
app.get("/api/recursos/:id/reservas", function (req, res) {
    conexion.query("SELECT * FROM reservas WHERE recurso = ?", [req.params.id], function (err, filas) {
        if (err) { console.error(err); return res.status(500).json("Error del servidor"); }
        res.status(200).json(filas);
    });
});

app.get("/api/recursos/:id/resenyas", function (req, res) {
    conexion.query("SELECT * FROM resenyas WHERE recurso = ?", [req.params.id], function (err, filas) {
        if (err) { console.error(err); return res.status(500).json("Error del servidor"); }
        res.status(200).json(filas);
    });
});


app.post("/api/area_salud", function (req, res) {
    conexion.query(
        "INSERT into areas_salud (codPostal, nombre, gestor, sanitario) VALUES (?, ?, ?, ?)",
        [req.body.codPostal, req.body.nombre, req.body.idGestor, null],
        function(err, resultado){
            if(err){
                console.log(err);
                return res.status(500).json("Error del servidor");
            }
            res.status(201).json({
                codPostal:  req.body.codPostal, 
                nombre: req.body.nombre,
                gestor: req.body.gestor,
                sanitario: null

            });
        }
    );

});



var PUERTO = process.env.PORT || 3000;   // Render pone PORT; en tu PC se usa 3000
var server = app.listen(PUERTO, function() {
    console.log("---------------------------------------");
    console.log("Servidor activo en puerto " + PUERTO);
    console.log("URL local: http://localhost:" + PUERTO + "/appCliente/index_gestor.html");
    console.log("---------------------------------------");
});


require("./servidor_rpc.js");

// Ctrl + C para parar el servidor

// npm start
// https://undefined.ua.es/telemedicina/api/datos
// https://github.com/paulaartes/telemedicinaP3.git
// https://telemedicinap3.onrender.com

/*
Para cambiar algo:
git add .
git commit -m "ACTUALIZADO"
git push
*/
