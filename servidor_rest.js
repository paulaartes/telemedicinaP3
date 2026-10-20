require("dotenv").config();   // carga las variables del archivo .env
var express = require("express");
var app = express();

// ===== SUPABASE =====
// 1. Importar el cliente de Supabase
var { createClient } = require("@supabase/supabase-js");

// 2. Configurar con la URL del proyecto y la clave pública (publishable / anon key)
var supabaseUrl = "https://dkcvwydxsnassjgmddhv.supabase.co";
var supabaseKey = "sb_publishable_ZaSKJ65T_eIw9-F5G6l6BA__Fk2Pvui";
var supabase = createClient(supabaseUrl, supabaseKey);

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

Con supabase-js cada consulta devuelve { data, error }:
- data  --> las filas (lo que antes era "filas")
- error --> el error, o null si todo ha ido bien
*/

// Login para gestor
app.post("/api/gestores/login", async function (req, res) { 
    console.log("Gestor: " + req.body.login);
    var login = req.body.login;
    var password = req.body.password;

    // SELECT * FROM gestores WHERE usuario = ? AND contra = ?
    var { data, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("usuario", login)
        .eq("contra", password);

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (data.length > 0) {
        var token = jwt.sign(
            { id: data[0].id },      
            SECRETO_JWT,              
            { expiresIn: "1h" }       
        );
        res.status(200).json({ id: data[0].id, token: token });
    } else {
        res.status(403).json("Login incorrecto");
    }
});

// Registro de un nuevo gestor
app.post("/api/gestores", async function (req, res) {
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var usuario = req.body.usuario;
    var password = req.body.password;

    // 1. Comprobamos que el usuario no existe: SELECT * FROM gestores WHERE usuario = ?
    var { data: existentes, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("usuario", usuario);

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (existentes.length > 0) {
        return res.status(400).json("El nombre de usuario ya está pillado");
    }

    // 2. Lo insertamos: INSERT INTO gestores (...) VALUES (...)
    //    .select() hace que nos devuelva la fila creada (con su id)
    var { data: creado, error: errorInsert } = await supabase
        .from("gestores")
        .insert({ nombre: nombre, apellidos: apellidos, usuario: usuario, contra: password })
        .select();

    if (errorInsert) {
        console.log(errorInsert);
        return res.status(500).json("Error del servidor");
    }
    res.status(201).json(creado[0].id);
});

// A partir de aquí, todas las rutas /api necesitan token pq Express recorre las rutas en el orden en que están escritas
app.use("/api", verificarToken);

// Obtener datos de un gestor 
app.get("/api/gestores/:id", async function (req, res) {
    // SELECT id, nombre, apellidos, usuario FROM gestores WHERE id = ?
    var { data, error } = await supabase
        .from("gestores")
        .select("id, nombre, apellidos, usuario")
        .eq("id", req.params.id);

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (data.length > 0) {
        res.status(200).json(data[0]);
    } else {
        res.status(404).json("Gestor no encontrado"); 
    }
});

// Actualizar datos de un gestor existente
app.put("/api/gestores/:id", async function (req, res) {
    var idBusca = req.params.id;

    // 1. Buscamos el gestor: SELECT * FROM gestores WHERE id = ?
    var { data: filas, error } = await supabase
        .from("gestores")
        .select("*")
        .eq("id", idBusca);

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (filas.length === 0) {
        return res.status(404).json("Gestor no encontrado");
    }

    var contra; // COGEMOS LA CONTRASEÑA SI SE CAMBIA
    if (req.body.password) {
        contra = req.body.password;
    } else {
        contra = filas[0].contra;
    }

    // 2. Lo actualizamos: UPDATE gestores SET ... WHERE id = ?
    var { error: errorUpdate } = await supabase
        .from("gestores")
        .update({ nombre: req.body.nombre, apellidos: req.body.apellidos, usuario: req.body.usuario, contra: contra })
        .eq("id", idBusca);

    if (errorUpdate) {
        console.log(errorUpdate);
        return res.status(500).json("Error del servidor");
    }
    console.log(req.body.nombre + " " + req.body.apellidos + " ha actualizado sus datos");
    res.status(200).json("Datos actualizados");
});


app.get("/api/ubicaciones", async function (req, res) {
    var { data, error } = await supabase.from("ubicaciones").select("*");   // SELECT * FROM ubicaciones
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});

app.get("/api/categorias", async function (req, res) {
    var { data, error } = await supabase.from("categorias").select("*");    // SELECT * FROM categorias
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});

app.get("/api/modelos", async function (req, res) {
    var { data, error } = await supabase.from("modelos").select("*");       // SELECT * FROM modelos
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});

app.get("/api/sanitarios", async function (req, res) {
    var { data, error } = await supabase.from("sanitarios").select("*");    // SELECT * FROM sanitarios
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});

// Obtener recursos con filtros opcionales 
app.get("/api/recursos", async function (req, res) {
    var cat = req.query.categoria; // req.query --> método GET para filtrar o buscar información
    var mod = req.query.modelo;
    var ubi = req.query.ubicacion;
    var est = req.query.estado;

    // Empezamos con "SELECT * FROM recursos" y vamos añadiendo condiciones (los AND de antes)
    var consulta = supabase.from("recursos").select("*");

    // La categoría no está en "recursos" sino en "modelos" (antes se hacía con un JOIN).
    // Aquí buscamos primero los modelos de esa categoría y luego filtramos los recursos por esos modelos.
    if (cat && cat !== "Todos") {
        var { data: modelosCat, error: errorModelos } = await supabase
            .from("modelos")
            .select("id")
            .eq("categoria", cat);

        if (errorModelos) {
            console.log(errorModelos);
            return res.status(500).json("Error del servidor");
        }
        var idsModelos = [];
        for (var i = 0; i < modelosCat.length; i++) {
            idsModelos.push(modelosCat[i].id);
        }
        consulta = consulta.in("modelo", idsModelos);   // AND recursos.modelo IN (...)
    }

    if (mod && mod !== "Todos") {
        consulta = consulta.eq("modelo", mod);          // AND recursos.modelo = ?
    }

    if (ubi && ubi !== "Todos") {
        consulta = consulta.eq("ubicacion", ubi);       // AND recursos.ubicacion = ?
    }

    if (est && est !== "Todos") {
        consulta = consulta.eq("estado", est);          // AND recursos.estado = ?
    }

    var { data, error } = await consulta;   // ahora sí se ejecuta la consulta
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});


app.post("/api/recursos", async function (req, res) {
    // INSERT INTO recursos (modelo, ubicacion, numero_serie, estado) VALUES (...)
    var { data, error } = await supabase
        .from("recursos")
        .insert({
            modelo: req.body.modelo,
            ubicacion: req.body.ubicacion,
            numero_serie: req.body.numero_serie,
            estado: req.body.estado
        })
        .select();   // para que nos devuelva la fila creada (con su id)

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(201).json(data[0]);   // { id, modelo, ubicacion, numero_serie, estado }
});

app.delete("/api/recursos/:id", async function (req, res) {
    // DELETE FROM recursos WHERE id = ?
    // .select() devuelve las filas borradas: así sabemos si se ha borrado alguna
    var { data, error } = await supabase
        .from("recursos")
        .delete()
        .eq("id", req.params.id)
        .select();

    if (error) {
        if (error.code === "23503") {   // clave ajena: hay reservas/reseñas asociadas
            return res.status(400).json("No se puede eliminar: el recurso tiene reservas o reseñas asociadas");
        }
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (data.length > 0) {
        res.status(200).json("Recurso eliminado correctamente");
    } else {
        res.status(404).json("No se ha encontrado el recurso con ID: " + req.params.id);
    }
});

app.put("/api/recursos/:id", async function (req, res) {
    // UPDATE recursos SET ... WHERE id = ?
    var { data, error } = await supabase
        .from("recursos")
        .update({
            modelo: req.body.modelo,
            ubicacion: req.body.ubicacion,
            numero_serie: req.body.numero_serie,
            estado: req.body.estado
        })
        .eq("id", req.params.id)
        .select();   // devuelve las filas actualizadas

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    if (data.length > 0) {
        res.status(200).json("Recurso actualizado correctamente");
    } else {
        res.status(404).json("No se ha encontrado el recurso con ID: " + req.params.id);
    }
});

//Reservas
app.get("/api/recursos/:id/reservas", async function (req, res) {
    // SELECT * FROM reservas WHERE recurso = ?
    var { data, error } = await supabase.from("reservas").select("*").eq("recurso", req.params.id);
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});

app.get("/api/recursos/:id/resenyas", async function (req, res) {
    // SELECT * FROM resenyas WHERE recurso = ?
    var { data, error } = await supabase.from("resenyas").select("*").eq("recurso", req.params.id);
    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(200).json(data);
});


app.post("/api/area_salud", async function (req, res) {
    // INSERT INTO areas_salud (codpostal, nombre, gestor, sanitario) VALUES (...)
    // OJO: en PostgreSQL la columna se llama "codpostal" (en minúsculas)
    var { error } = await supabase
        .from("areas_salud")
        .insert({
            codpostal: req.body.codPostal,
            nombre: req.body.nombre,
            gestor: req.body.idGestor,
            sanitario: null
        });

    if (error) {
        console.log(error);
        return res.status(500).json("Error del servidor");
    }
    res.status(201).json({
        codPostal: req.body.codPostal, 
        nombre: req.body.nombre,
        gestor: req.body.idGestor,
        sanitario: null
    });
});



var PUERTO = process.env.PORT || 3000;   // Render pone PORT; en tu PC se usa 3000
var server = app.listen(PUERTO, function() {
    console.log("---------------------------------------");
    console.log("Servidor activo en puerto " + PUERTO);
    console.log("URL local: http://localhost:" + PUERTO + "/appCliente/index_gestor.html");
    console.log("---------------------------------------");
});


// El servidor RPC del sanitario solo se arranca en local.
// Render pone automáticamente la variable RENDER, y allí no hace falta.
if (!process.env.RENDER) {
    require("./servidor_rpc.js");
}

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
