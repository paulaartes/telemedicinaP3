//Es necesario instalar en la carpeta del servidor los modulos cors y express

var rpc = require("./rpc.js"); 
var conexion = require("./conexion.js");

function obtenerCategorias(callback){
    conexion.query(
        "SELECT * FROM categorias",
        function(err, filas){
            if (err) { 
                console.error(err); 
                return callback([]); 
            }
            callback(filas);
        }
    );
}

function obtenerModelos(callback){
    conexion.query(
        "SELECT * FROM modelos",
        function(err, filas){
            if (err) { 
                console.error(err); 
                return callback([]); 
            }
            callback(filas);
        }
    );
}

function obtenerUbicaciones(callback) {
    conexion.query(
        "SELECT * FROM ubicaciones",
        function(err, filas){
            if (err) { 
                console.error(err); 
                return callback([]); 
            }
            callback(filas);
        }
    );
}

function loginSanitario(usuario, contrasenya, callback){
    conexion.query(
        "SELECT id FROM sanitarios WHERE usuario = ? AND contra = ?",
        [usuario, contrasenya],
        function (err, filas) {
            if (err) { 
                console.error(err); 
                return callback(null); 
            }
            if (filas.length > 0) {
                callback(filas[0].id);
            } else {
                callback(null);
            }
        }
        
    );

}

function crearSanitario(datosSanitario,callback){
    var n = datosSanitario.nombre;
    var apell = datosSanitario.apellidos;
    var us = datosSanitario.usuario;
    var c = datosSanitario.contra;

    if( !n || !apell || !us || !c){
        return callback(null);
    }
    conexion.query(
        "SELECT id FROM sanitarios WHERE usuario = ?", [us],
        function(err,filas){
            if(err){
                console.error(err); 
                return callback(null); 
            }
            if(filas.length>0){
                console.log("Usuario existente");
                return callback(null); 
            }

            conexion.query(
                "INSERT INTO sanitarios (nombre, apellidos, usuario, contra) VALUES (?, ?, ?, ?)",
                [n, apell,us,c],
                function(err, resultado){
                    if(err){
                        console.error(err); 
                        return callback(null); 
                    }
                    callback(resultado.insertId);
                }
            );
        }
    );
    

}


function actualizarSanitario(id, datos, callback){
    conexion.query(
        "SELECT * FROM sanitarios WHERE id = ? ", [id],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(false); 
            }
            if(filas.length===0){
                return callback(false); 
            }
            var contra; // COGEMOS LA CONTRASEÑA SI SE CAMBIA
            if (datos.contra) {
                contra = datos.contra;
            } else {
                contra = filas[0].contra;
            }
            conexion.query(
                "UPDATE sanitarios SET nombre = ?, apellidos = ?, usuario = ?, contra = ? WHERE id = ?",
                [datos.nombre, datos.apellidos, datos.usuario, contra, id],
                function(err){
                    if(err){
                        console.error(err); 
                        return callback(false);
                    }
                    callback(true);
                }
            );
        }
    ); 
}

function obtenerSanitario(id,callback) {
    conexion.query(
        "SELECT id, nombre, apellidos, usuario FROM sanitarios WHERE id = ?", [id],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(null);
            }
            if (filas.length > 0) {
                callback(filas[0]);
            } else {
                callback(null);
            }
        }
    );
    
}

function obtenerRecursos(id, callback){
    conexion.query(
        "SELECT * FROM recursos WHERE modelo = ? AND estado = 0", [id],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(null);
            }
            if (filas.length > 0) {
                return callback(filas);
            } else {
                return callback(null);
            }
        }
    );
}

function tiempoPendiente(idRecurso, callback) {
    conexion.query(
        "SELECT CAST(SUM(horas_estimadas) AS INTEGER) AS total FROM reservas WHERE recurso = ? AND fecha_fin IS NULL",
        [idRecurso],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(0); 
            }
            var total;
            if (filas[0].total === null) {
                total = 0;
            } else {
                total = filas[0].total;
            }   
            return callback(total);
        }
    );
}


function obtenerReservas(id, callback){
    conexion.query(
        "SELECT * FROM reservas WHERE sanitario = ? ", [id],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(null); 
            }
            if(filas.length===0){
                return callback(null); 
            } else{
                return callback(filas);
            }
        }
    );
   
}


function obtenerResenyas(id, callback){
    conexion.query(
        "SELECT * FROM resenyas WHERE recurso = ?", [id],
        function(err,filas){
            if(err){
                console.error(err); 
                return callback(null); 
            }
            if(filas.length===0){
                return callback(null); 
            } else{
                return callback(filas);
            }
        }
    );

}


function crearResenya(idRecurso,idSanitario, valoracion, descripcion, callback){
    conexion.query("SELECT id FROM sanitarios WHERE id = ?", [idSanitario], 
        function (err, sanitarios) {
            if (err) { 
                console.error(err); 
                return callback(null); 
            }
            conexion.query("SELECT id FROM recursos WHERE id = ?", [idRecurso], 
                function (err, recursos) {
                    if (err) { 
                        console.error(err); 
                        return callback(null); 
                    }
                    if (sanitarios.length === 0 || recursos.length === 0) {
                        return callback(null);
                    }
                    var fecha = new Date().toLocaleDateString('es-ES').replace(',', '');
                    conexion.query(
                        "INSERT INTO resenyas (recurso, sanitario, fecha, valor, descripcion) VALUES (?, ?, ?, ?, ?)",
                        [idRecurso, idSanitario, fecha, valoracion, descripcion],
                        function (err, result) {
                            if (err) { console.error(err); return callback(null); }
                            return callback(result.insertId);
                        }
                    );
            });
    });
}

function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback){

    conexion.query("SELECT id FROM sanitarios WHERE id = ?", [idSanitario], 
        function (err, sanitarios) {
            if (err) { 
                console.error(err); 
                return callback(null); 
            }
            conexion.query("SELECT id FROM recursos WHERE id = ?", [idRecurso], 
                function (err, recursos) {
                    if (err) { 
                        console.error(err); 
                        return callback(null); 
                    }
                    if (sanitarios.length === 0 || recursos.length === 0) {
                        return callback(null);
                    }

                    var ahora = new Date();
                    var dia = String(ahora.getDate()).padStart(2, '0');
                    var mes = String(ahora.getMonth() + 1).padStart(2, '0');
                    var anyo = String(ahora.getFullYear()).slice(-2);
                    var horas = String(ahora.getHours()).padStart(2, '0');
                    var minutos = String(ahora.getMinutes()).padStart(2, '0');
                    var segundos = String(ahora.getSeconds()).padStart(2, '0');
                    var fechaFormateada = dia + "/" + mes + "/" + anyo + " " + horas + ":" + minutos + ":" + segundos;

                    conexion.query(
                        "INSERT INTO reservas (recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, NULL, NULL)",
                        [idRecurso, idSanitario, horasEstimadas, fechaFormateada],
                        function (err, result) {
                            if (err) { 
                                console.error(err); 
                                return callback(null); 
                            }
                            return callback(result.insertId);
                        }
                    );
                }
            );
        }
    );
}

function cancelarReserva(idReserva, callback) {
    conexion.query("DELETE FROM reservas WHERE id = ?", [idReserva], 
        function (err, result) {
            if (err) { 
                console.error(err); 
                return callback(false); 
            }
            if (result.affectedRows > 0) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

function iniciarReserva(idReserva, callback) {
    var ahora = new Date();
    var dia = String(ahora.getDate()).padStart(2, '0');
    var mes = String(ahora.getMonth() + 1).padStart(2, '0');
    var anyo = String(ahora.getFullYear()).slice(-2);
    var horas = String(ahora.getHours()).padStart(2, '0');
    var minutos = String(ahora.getMinutes()).padStart(2, '0');
    var segundos = String(ahora.getSeconds()).padStart(2, '0');
    var fechaInicio = dia + "/" + mes + "/" + anyo + " " + horas + ":" + minutos + ":" + segundos;

    conexion.query(
        "UPDATE reservas SET fecha_inicio = ? WHERE id = ?",
        [fechaInicio, idReserva],
        function (err, result) {
            if (err) { 
                console.error(err); 
                return callback(false); 
            }
            return callback(result.affectedRows > 0);
        }
    );
}
3

function finalizarReserva(idReserva, callback) { // Devolución del recurso
    var ahora = new Date().toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(',', '');

    conexion.query(
        "UPDATE reservas SET fecha_fin = ? WHERE id = ?",
        [ahora, idReserva],
        function (err, result) {
            if (err) { 
                console.error(err);
                return callback(false); 
            }
            return callback(result.affectedRows > 0);
        }
    );
}

function obtenerRecurso(idRecurso, callback) {
    conexion.query("SELECT * FROM recursos WHERE id = ?", [idRecurso], 
        function (err, filas) {
            if (err) { 
                console.error(err); 
                return callback(null); 
            }
            return callback(filas.length > 0 ? filas[0] : null);
        }
    );
}

function asignarArea(idSanitario,codigoPostal, callback){
    conexion.query("SELECT * FROM areas_salud WHERE sanitario = ?", [idSanitario], 
        function (err, filas) {
            if (err) { 
                console.error(err); 
                console.log("Área de salud no creada");
                return callback(false); 
                
            }
            if(filas.length>0){
                console.log("El sanitario ya tiene asignado un área de salud"); 
                return callback(false);
            } else{
                conexion.query(
                    "UPDATE areas_salud SET sanitario = ? WHERE codPostal = ?", [idSanitario, codigoPostal],
                    function(err){
                        if(err){
                            console.error(err); 
                            return callback(false);
                        }
                        return callback(true);
                    }
                )
            }
        }
    );
}

function borrarResenya(idResenya, callback){
    conexion.query("DELETE FROM resenyas WHERE id = ?", [idResenya], 
        function (err, result) {
            if (err) { 
                console.error(err); 
                return callback(false); 
            }
            if (result.affectedRows > 0) {
                return callback(true);
            } else {
                return callback(false);
            }
        }
    );
}

function obtenerSanitarioRec(idRec,callback) {
    conexion.query(
        "SELECT sanitario, fecha_inicio FROM reservas WHERE fecha_inicio IS NOT NULL AND fecha_fin IS NULL AND recurso = ?", [idRec],
        function(err, filas){
            if(err){
                console.error(err); 
                return callback(null);
            }
            if (filas.length > 0) {
                callback(filas[0]);
            } else {
                callback(null);
            }
        }
    );
    
}

var servidor = rpc.server(); // crear el servidor RPC
var app = servidor.createApp("gestion_pacientes"); // crear aplicación de RPC

app.registerAsync(obtenerSanitario);
app.registerAsync(obtenerCategorias);
app.registerAsync(obtenerUbicaciones);
app.registerAsync(loginSanitario);
app.registerAsync(crearSanitario);
app.registerAsync(obtenerModelos);
app.registerAsync(actualizarSanitario);
app.registerAsync(obtenerRecursos);
app.registerAsync(obtenerReservas);
app.registerAsync(obtenerResenyas);
app.registerAsync(crearResenya);
app.registerAsync(reservarRecurso);
app.registerAsync(tiempoPendiente);
app.registerAsync(cancelarReserva);
app.registerAsync(iniciarReserva);
app.registerAsync(finalizarReserva);
app.registerAsync(obtenerRecurso);
app.registerAsync(asignarArea);
app.registerAsync(borrarResenya); // BORRAR
app.registerAsync(obtenerSanitarioRec); // BORRAR
