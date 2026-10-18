// ── Conexión RPC ─────────────────────────────────────────────────────────
var app = rpc("localhost", "gestion_pacientes");

var obtenerSanitario    = app.procedure("obtenerSanitario");
var obtenerCategorias   = app.procedure("obtenerCategorias");
var obtenerUbicaciones  = app.procedure("obtenerUbicaciones");
var loginSanitario      = app.procedure("loginSanitario");
var crearSanitario      = app.procedure("crearSanitario");
var obtenerModelos      = app.procedure("obtenerModelos");
var actualizarSanitario = app.procedure("actualizarSanitario");
var obtenerRecursos     = app.procedure("obtenerRecursos");
var obtenerReservas     = app.procedure("obtenerReservas");
var obtenerResenyas     = app.procedure("obtenerResenyas");
var crearResenya        = app.procedure("crearResenya");
var reservarRecurso     = app.procedure("reservarRecurso");
var tiempoPendiente     = app.procedure("tiempoPendiente");
var cancelarReserva     = app.procedure("cancelarReserva");
var iniciarReserva      = app.procedure("iniciarReserva");
var finalizarReserva    = app.procedure("finalizarReserva");
var obtenerRecurso      = app.procedure("obtenerRecurso");
var asignarArea         = app.procedure("asignarArea");

// ── Variables globales ────────────────────────────────────────────────────
var idSanitarioLogueado     = null;
var nombreSanitarioLogueado = null;
var idRecursoSeleccionado   = null;
var categoriaArray = [];
var modeloArray    = [];
var ubicacionArray = [];


// ── Navegación ────────────────────────────────────────────────────────────
function navegarA(idVista) {
    var vistas = document.querySelectorAll('.vista');
    for (var i = 0; i < vistas.length; i++) {
        vistas[i].classList.remove('activa');
    }
    document.getElementById(idVista).classList.add('activa');
}


// ═════════════════════════════════════════════════════════════════════════
// LOGIN / REGISTRO
// ═════════════════════════════════════════════════════════════════════════

function login() {
    var loginVal = document.getElementById("log-user").value;
    var passVal  = document.getElementById("log-pass").value;

    loginSanitario(loginVal, passVal, function(id) {
        if (id != null) {
            idSanitarioLogueado = id;
            cargarCatalogos(function() {
                obtenerSanitario(id, function(datos) {
                    if (datos != null) {
                        nombreSanitarioLogueado = datos.nombre + " " + datos.apellidos;
                        document.getElementById("nombre-bienvenida").innerText = nombreSanitarioLogueado;
                        listaAvisos = [];
                        cargarInicioSanitario();
                        navegarA('vista-inicio');
                    }
                });
            });
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
}

function cargarCatalogos(callbackFinal) {
    obtenerCategorias(function(listaCat) {
        if (listaCat) {
            for (var i = 0; i < listaCat.length; i++) {
                categoriaArray[listaCat[i].id] = listaCat[i].nombre;
            }
        }
        obtenerModelos(function(listaMod) {
            if (listaMod) {
                for (var j = 0; j < listaMod.length; j++) {
                    modeloArray[listaMod[j].id] = listaMod[j].nombre;
                }
            }
            obtenerUbicaciones(function(listaUb) {
                if (listaUb) {
                    for (var k = 0; k < listaUb.length; k++) {
                        ubicacionArray[listaUb[k].id] = listaUb[k].nombre;
                    }
                }
                callbackFinal();
            });
        });
    });
}

function prepararRegistro() {
    idSanitarioLogueado = null;
    document.getElementById("reg-nombre").value    = "";
    document.getElementById("reg-apellidos").value = "";
    document.getElementById("reg-login").value     = "";
    document.getElementById("reg-password").value  = "";
    navegarA('vista-registro');
}

function guardarSanitario() {
    var datos = {
        nombre:    document.getElementById("reg-nombre").value,
        apellidos: document.getElementById("reg-apellidos").value,
        usuario:   document.getElementById("reg-login").value,
        contra:    document.getElementById("reg-password").value
    };

    if (idSanitarioLogueado != null) {
        actualizarSanitario(idSanitarioLogueado, datos, function() {
            alert("Datos actualizados correctamente.");
            nombreSanitarioLogueado = datos.nombre + " " + datos.apellidos;
            document.getElementById("nombre-bienvenida").innerText = nombreSanitarioLogueado;
            navegarA('vista-inicio');
        });
    } else {
        crearSanitario(datos, function(idGenerado) {
            if (idGenerado != null) {
                alert("Registro completado. Ya puedes hacer login.");
                navegarA('vista-login');
            } else {
                alert("Error: El usuario ya existe");
            }
        });
    }
}

function cancelarRegistro() {
    if (idSanitarioLogueado !== null) {
        navegarA('vista-inicio');
    } else {
        navegarA('vista-login');
    }
}

function prepararEdicionGestor() {
    if (idSanitarioLogueado != null) {
        obtenerSanitario(idSanitarioLogueado, function(datos) {
            if (datos != null) {
                document.getElementById("reg-nombre").value    = datos.nombre;
                document.getElementById("reg-apellidos").value = datos.apellidos;
                document.getElementById("reg-login").value     = datos.usuario;
                document.getElementById("reg-password").value  = "";
                navegarA("vista-registro");
            }
        });
    }
}

function salir() {
    idSanitarioLogueado     = null;
    nombreSanitarioLogueado = null;
    listaAvisos             = [];
    navegarA('vista-login');
}

// ═════════════════════════════════════════════════════════════════════════
// INICIO (tablas de reservas)
// ═════════════════════════════════════════════════════════════════════════

function cargarInicioSanitario() {
    obtenerReservas(idSanitarioLogueado, function(listaReservas) {
        var tablaP = document.getElementById("tabla-pendientes");
        var tablaR = document.getElementById("tabla-realizadas");

        tablaP.getElementsByTagName("tbody")[0].innerHTML = "";
        tablaR.getElementsByTagName("tbody")[0].innerHTML = "";


        if (!listaReservas || listaReservas.length === 0) return;

        obtenerModelos(function(todosLosModelos) {
            listaReservas.forEach(function(res) {
                obtenerRecurso(res.recurso, function(rec) {
                    if (!rec) return;

                    var modObj    = todosLosModelos.find(function(m) { return m.id == rec.modelo; });
                    var nombreMod = modObj ? modObj.nombre : "Desconocido";
                    var nombreCat = modObj ? categoriaArray[modObj.categoria] : "Desconocido";
                    var nombreUbi = ubicacionArray[rec.ubicacion] || "Almacén";

                    if (res.fecha_fin == null) {
                        tiempoPendiente(res.recurso, function(hRestTotal) {
                            var hEsperaOtros = hRestTotal - res.horas_estimadas;
                            if (hEsperaOtros < 0) hEsperaOtros = 0;

                            var botonRetirar = "";
                            if (hEsperaOtros == 0 && res.fecha_inicio == null) {
                                botonRetirar = "<button onclick='retirar(" + res.id + "," + rec.id + ")'>Retirar</button>";
                            }

                            if (res.fecha_inicio != null) {
                                agregarARealizadas(res, rec, nombreCat, nombreMod);
                            } else {
                                tablaP.getElementsByTagName("tbody")[0].innerHTML +=
                                    "<tr>" +
                                    "<td>" + nombreCat + "</td>" +
                                    "<td>" + nombreMod + "</td>" +
                                    "<td>" + rec.numero_serie + "</td>" +
                                    "<td>" + nombreUbi + "</td>" +
                                    "<td>" + res.fecha_peticion + "</td>" +
                                    "<td>" + hEsperaOtros + "</td>" +
                                    "<td>" + botonRetirar + "</td>" +
                                    "<td><button onclick='cancelar(" + res.id + ")'>X</button></td>" +
                                    "</tr>";
                            }
                        });
                    } else {
                        agregarARealizadas(res, rec, nombreCat, nombreMod);
                    }
                });
            });
        });
    });
}

function agregarARealizadas(res, rec, cat, mod) {
    var tablaR = document.getElementById("tabla-realizadas");
    var fFin = res.fecha_fin
        ? res.fecha_fin.toString()
        : "<button onclick='devolver(" + res.id + "," + rec.id + ")'>Devolver</button>";
    var fIni = res.fecha_inicio ? res.fecha_inicio.toString() : "";

    tablaR.getElementsByTagName("tbody")[0].innerHTML +=
        "<tr>" +
        "<td>" + cat + "</td>" +
        "<td>" + mod + "</td>" +
        "<td>" + rec.numero_serie + "</td>" +
        "<td>" + res.horas_estimadas + "</td>" +
        "<td>" + fIni + "</td>" +
        "<td>" + fFin + "</td>" +
        "<td><button onclick='prepararResenya(" + rec.id + ")'>Reseña</button></td>" +
        "</tr>";
}

// ═════════════════════════════════════════════════════════════════════════
// ACCIONES SOBRE RESERVAS
// ═════════════════════════════════════════════════════════════════════════

function retirar(idReserva, idRecurso) {
    iniciarReserva(idReserva, function(exito) {
        if (exito) {
            cargarInicioSanitario();
        } else {
            alert("No se ha podido retirar el recurso.");
        }
    });
}

function cancelar(idReserva) {
    cancelarReserva(idReserva, function(confirmacion) {
        if (confirmacion) {
            cargarInicioSanitario();
        } else {
            alert("No se ha podido cancelar la reserva.");
        }
    });
}

function devolver(idReserva, idRecurso) {
    finalizarReserva(idReserva, function(confirmacion) {
        if (confirmacion) {
            cargarInicioSanitario();
        } else {
            alert("No se ha podido devolver el recurso.");
        }
    });
}

// ═════════════════════════════════════════════════════════════════════════
// NUEVA RESERVA
// ═════════════════════════════════════════════════════════════════════════

function prepararNuevaReserva() {
    obtenerCategorias(function(cat) {
        if (cat) {
            rellenarSelect("f-categoria", cat);
            actualizarModelos();
            navegarA('vista-nueva-reserva');
        }
    });
}

function actualizarModelos() {
    var idCat = document.getElementById("f-categoria").value;
    obtenerModelos(function(todosLosModelos) {
        var listaFiltrada = [];
        for (var i = 0; i < todosLosModelos.length; i++) {
            if (todosLosModelos[i].categoria == idCat) listaFiltrada.push(todosLosModelos[i]);
        }
        rellenarSelect("f-modelo", listaFiltrada);
    });
}

function actualizarTablaRecursos() {
    var idModelo = document.getElementById("f-modelo").value;
    var tbody = document.getElementById("tabla-recursos-reserva").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    obtenerRecursos(idModelo, function(listaRec) {
        if (!listaRec || listaRec.length === 0) {
            alert("No hay recursos operativos para este modelo.");
            return;
        }

        var totalRec    = listaRec.length;
        var completados = 0;
        var filas = new Array(totalRec);

        for (var i = 0; i < listaRec.length; i++) {
            (function(rec, index) {
                tiempoPendiente(rec.id, function(hRestTotal) {
                    obtenerResenyas(rec.id, function(listaRes) {
                        var media = "Sin notas";
                        if (listaRes && listaRes.length > 0) {
                            var suma = 0;
                            for (var j = 0; j < listaRes.length; j++) suma += listaRes[j].valor;
                            media = (suma / listaRes.length).toFixed(1);
                        }

                        var txtHRest, txtBoton, accion;
                        if (hRestTotal == 0) {
                            txtHRest = "Disponible";
                            txtBoton = "Retirar";
                            accion   = "retirarDirecto";
                        } else {
                            txtHRest = hRestTotal;
                            txtBoton = "Reservar";
                            accion   = "crearReservaNueva";
                        }

                        filas[index] = "<tr>" +
                            "<td>" + rec.numero_serie + "</td>" +
                            "<td>" + (ubicacionArray[rec.ubicacion] || "Almacén") + "</td>" +
                            "<td>" + txtHRest + "</td>" +
                            "<td>" + media + "</td>" +
                            "<td><button onclick=\"" + accion + "(" + rec.id + ")\">" + txtBoton + "</button></td>" +
                            "</tr>";

                        completados++;
                        if (completados === totalRec) tbody.innerHTML = filas.join("");
                    });
                });
            })(listaRec[i], i);
        }
    });
}

function crearReservaNueva(idRec) {
    var horas = parseInt(document.getElementById("t_uso-valor").value);
    reservarRecurso(idRec, idSanitarioLogueado, horas, function(idRes) {
        if (idRes) {
            alert("Reserva realizada con éxito.");
            cargarInicioSanitario();
            actualizarTablaRecursos();
            navegarA('vista-inicio');
        }
    });
}

function retirarDirecto(idRec) {
    var horas = parseInt(document.getElementById("t_uso-valor").value);
    reservarRecurso(idRec, idSanitarioLogueado, horas, function(idRes) {
        if (idRes) {
            iniciarReserva(idRes, function(exito) {
                if (exito) {
                    cargarInicioSanitario();
                    actualizarTablaRecursos();
                    navegarA('vista-inicio');
                }
            });
        }
    });
}

// ═════════════════════════════════════════════════════════════════════════
// RESEÑAS
// ═════════════════════════════════════════════════════════════════════════

function prepararResenya(idRecurso) {
    idRecursoSeleccionado = idRecurso;
    obtenerRecurso(idRecurso, function(recurso) {
        if (recurso) {
            document.getElementById("resenya-nserie").innerText = recurso.numero_serie;
            document.getElementById("resenya-valor").value = "4";
            document.getElementById("resenya-texto").value = "";
            navegarA('vista-crear-resenya');
        }
    });
}

function guardarResenya() {
    var valoracion  = parseInt(document.getElementById("resenya-valor").value);
    var descripcion = document.getElementById("resenya-texto").value;
    if (!descripcion.trim()) {
        alert("Por favor, escribe un comentario para la reseña.");
        return;
    }
    crearResenya(idRecursoSeleccionado, idSanitarioLogueado, valoracion, descripcion, function(idNuevaResenya) {
        if (idNuevaResenya) {
            alert("Reseña guardada correctamente.");
            navegarA('vista-inicio');
        } else {
            alert("Error al guardar la reseña.");
        }
    });
}

function asignarAreaSalud(){
    var codPostal= document.getElementById("f-codPostal").value;
    asignarArea(idSanitarioLogueado,codPostal, function(resultado){
        if(resultado == false){
            alert("Área de salud no creada o sanitario ya adscrito a una");
        } else{
            alert("Sanitario adscrito correctamente");
        }
        document.getElementById("f-codPostal").value = "";
    });

}

// ═════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═════════════════════════════════════════════════════════════════════════

function rellenarSelect(id, lista) {
    var s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = "";
    for (var i = 0; i < lista.length; i++) {
        var opt = document.createElement("option");
        opt.value = lista[i].id;
        opt.text  = lista[i].nombre;
        s.add(opt);
    }
}

