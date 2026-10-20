// rest.get(url, callback)
// rest.post(url, body, callback)
// rest.put(url, body, callback)
// rest.delete(url, callback)

let idGestorLogueado = null;
let tokenGestor = null;
var catalogos = {
    categorias: [],
    ubicaciones: [],
    modelos: []
};
var listaSanitarios = [];
var recursos = [];

var idRecursoEnEdicion = null; // Para saber si se está editando o creando un recurso


function navegarA(idVista) {
    var vistas = document.querySelectorAll('.vista');
    for (var i = 0; i < vistas.length; i++) {
        vistas[i].classList.remove('activa');
    }
    document.getElementById(idVista).classList.add('activa');
}

function cargarCatalogos(){ // lo ponemos para que se cargue justo al hacer login
    var r;

    r = rest.get("/api/categorias");
    if (r.status == 200) {
        catalogos.categorias = r.response;
        rellenarSelect("bus-categoria", r.response, true);
        rellenarSelect("f-categoria", r.response, false);
    }

    r = rest.get("/api/modelos");
    if (r.status == 200) {
        catalogos.modelos = r.response;
        rellenarSelect("bus-modelo", r.response, true);
    }

    r = rest.get("/api/ubicaciones");
    if (r.status == 200) {
        catalogos.ubicaciones = r.response;
        rellenarSelect("bus-ubicacion", r.response, true);
        rellenarSelect("f-ubicacion", r.response, false);
    }

    r = rest.get("/api/sanitarios");
    if (r.status == 200) {
        listaSanitarios = r.response;
    }
}

// LOGIN Y REGISTRO

function login() { 
    var loginVal = document.getElementById("log-user").value;
    var passVal = document.getElementById("log-pass").value;

    var datos = { login: loginVal, password: passVal };
    console.log("Intentando iniciar sesión con usuario:", loginVal);

    rest.post("/api/gestores/login", datos, function(status, respuesta) {
        if (status === 200) {
            idGestorLogueado = respuesta.id;
            tokenGestor = respuesta.token;
            cargarCatalogos();   // Se pide después del token, podemos pedirlos
            console.log("Token recibido:", tokenGestor);
            rest.get("/api/gestores/" + idGestorLogueado, function(status, g) {
                document.getElementById("nombre-bienvenida").innerText = g.nombre + " " + g.apellidos;
                nombreGestorLogueado = g.nombre + " " + g.apellidos;
                listaAvisos = [];
                navegarA('vista-inicio');
                buscarRecursos(); 
                cargarRanking();
            });
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
}

function prepararRegistro() { 
    idGestorLogueado = null;
    document.getElementById("reg-nombre").value = "";
    document.getElementById("reg-apellidos").value = "";
    document.getElementById("reg-login").value = "";
    document.getElementById("reg-password").value = "";

    navegarA('vista-registro');
}


function guardarGestor() { 
    // Recogemos los datos de los inputs
    var datos = {
        nombre: document.getElementById("reg-nombre").value,
        apellidos: document.getElementById("reg-apellidos").value,
        usuario: document.getElementById("reg-login").value,
        password: document.getElementById("reg-password").value
    };

    if (idGestorLogueado !== null) {
        // Actualizar
        rest.put("/api/gestores/" + idGestorLogueado, datos, function(status, mensaje) {
            if (status === 200) {
                console.log("Perfil actualizado para el ID:", idGestorLogueado, datos); // Log de edición
                alert("Datos actualizados correctamente");
                // Actualizamos el nombre en la pantalla de inicio y volvemos
                document.getElementById("nombre-bienvenida").innerText = datos.nombre + " " + datos.apellidos;
                navegarA('vista-inicio');
            }
        });
    } else {
        // Usuario nuevo
        rest.post("/api/gestores", datos, function(status, idGenerado) {
            if (status === 201) {
                console.log("Nuevo gestor registrado con ID:", idGenerado); // Log de creación
                alert("Registro completado. Ya puedes hacer login.");
                navegarA('vista-login');
            } else {
                alert("Error: El usuario ya existe");
            }
        });
    }
}


function cancelarRegistro() { 
    if (idGestorLogueado !== null) {
        navegarA('vista-inicio');
    } 
    else {
        navegarA('vista-login');
    }
}

function prepararEdicionGestor() {
    navegarA("vista-registro");
    rest.get("/api/gestores/" + idGestorLogueado, function(s,g) { //idGestorLogueado en rest.get siempre que necesites consultar, mostrar o editar los datos específicos del usuario que tiene la sesión abierta
        if(s==200){           
            document.getElementById("reg-nombre").value = g.nombre;
            document.getElementById("reg-apellidos").value = g.apellidos;
            document.getElementById("reg-login").value = g.usuario;
            document.getElementById("reg-password").value = "";          
        }
    });
    
}


function actualizarModelosBusqueda() {
    var idCat = document.getElementById("bus-categoria").value;
    var modelosFiltrados = [];

    // Si la categoría es "Todos", mostramos todos los modelos
    if (idCat === "Todos") {
        modelosFiltrados = catalogos.modelos;
    } else {
        // Recorremos todos los modelos y guardamos solo los que coinciden con la categoría
        for (var i = 0; i < catalogos.modelos.length; i++) {
            var m = catalogos.modelos[i];
            if (m.categoria == idCat) {
                modelosFiltrados.push(m);
            }
        }
    }

    // Actualizamos el desplegable de modelos del buscador
    rellenarSelect("bus-modelo", modelosFiltrados, true);
}


function buscarRecursos() { 
    var c = document.getElementById("bus-categoria").value;
    var m = document.getElementById("bus-modelo").value;
    var u = document.getElementById("bus-ubicacion").value;
    var e = document.getElementById("bus-estado").value;

    console.log("Filtrando recursos...");
    var url = "/api/recursos?categoria=" + c + "&modelo=" + m + "&ubicacion=" + u + "&estado=" + e;
    
    rest.get(url, function(status, data) {
        if(status == 200) {
            console.log("Datos recibidos:", data);
            recursos=data;
            pintarTablaRecursos(data);
        }
    });
}


function nuevaFicha(){
    idRecursoEnEdicion  =null;
    document.getElementById("f-numserie").value="";
    navegarA("vista-recurso");
}


function logout(){
    tokenGestor = null;
    idGestorLogueado = null;
    navegarA('vista-login');
}

function actualizarModelosFicha(){
    var idCat= document.getElementById("f-categoria").value;
    var lista= [];
    for(var i=0; i<catalogos.modelos.length;i++){
        if(catalogos.modelos[i].categoria==idCat){
            lista.push(catalogos.modelos[i]);
        }
    }
    rellenarSelect("f-modelo", lista, false); // Es false porque un objeto físico solo puede ser de un modelo específico a la vez
}

function guardarRecurso(){
    var datos={
        modelo: document.getElementById("f-modelo").value,
        ubicacion: document.getElementById("f-ubicacion").value,
        numero_serie: document.getElementById("f-numserie").value,
        estado: document.getElementById("f-estado").value,
    }

    if (idRecursoEnEdicion) {
        // Si hay ID, usamos PUT para actualizar 
        rest.put("/api/recursos/" + idRecursoEnEdicion, datos, function(status) {
            if (status == 200) { 
                alert("Actualizado"); 
                navegarA('vista-inicio'); 
                buscarRecursos(); }
        });
    } else {
        // Si no hay ID, usamos POST para crear 
        rest.post("/api/recursos", datos, function(status,nuevoRecurso) {
            if (status == 201) { 
                console.log("Recurso creado:", nuevoRecurso); 
                alert("Creado"); 
                navegarA('vista-inicio'); 
                buscarRecursos(); 
            }
        });
    }
}

function volverAlListado() {
    navegarA('vista-inicio');
    buscarRecursos(); // Refrescamos por si hubo cambios
}


function crearAreaSalud(){
    var datos={
        codPostal: document.getElementById("f-codPostal").value,
        nombre: document.getElementById("f-nombreArea").value,
        idGestor:idGestorLogueado
    }
    rest.post("/api/area_salud", datos, function(status,nuevaArea) {
            if (status == 201) { 
                console.log("Área creada:", nuevaArea); 
                alert("Área creada"); 
                document.getElementById("f-codPostal").value = "";
                document.getElementById("f-nombreArea").value = "";
            } else{
                alert("Código postal ya usado");
            }
        });
}

/*
    FUNCIONES AUXILIARES
*/

function rellenarSelect(id, lista, incluirTodos) {
    var s = document.getElementById(id);
    if (!s) return;

    s.innerHTML = "";
    if (incluirTodos == true) {
        s.innerHTML = '<option value="Todos">Todos</option>';
    }

    // Bucle para añadir opciones al select
    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var opt = document.createElement("option");
        opt.value = item.id;
        opt.text = item.nombre;
        s.add(opt);
    }
}

function pintarTablaRecursos(lista) {
    var body = document.getElementById("tabla-recursos-body");
    body.innerHTML = "";
    
    // Bucle para rellenar la tabla del inventario
    for (var i = 0; i < lista.length; i++) {
        var r = lista[i];
        var fila = body.insertRow();
        
        fila.insertCell(0).innerText = r.numero_serie;
        fila.insertCell(1).innerText = obtenerNombreCat(r.modelo);
        fila.insertCell(2).innerText = obtenerNombreMod(r.modelo);
        fila.insertCell(3).innerText = obtenerNombreUbi(r.ubicacion);
        
        // Sustitución de operador ternario por IF completo
        var nombreEstado = "";
        if (r.estado == 0) {
            nombreEstado = "Operativo";
        } else if (r.estado == 1) {
            nombreEstado = "Baja";
        } else {
            nombreEstado = "Mantenimiento";
        }
        
        fila.insertCell(4).innerText = nombreEstado;
        fila.insertCell(5).innerHTML = '<button onclick="verDetalle(' + r.id + ')">Abrir</button>' +
                                  '<button onclick="borrarRecurso(' + r.id + ')">Borrar</button>';
    }
}

function obtenerNombreMod(id) {
    
    for (var i = 0; i < catalogos.modelos.length; i++) {
        if (catalogos.modelos[i].id == id) {
            return catalogos.modelos[i].nombre;
        }
    }
    return id; // Si no encuentra el modelo devuelve el ID
}

function obtenerNombreCat(idMod) {
    var idCat = -1;
    // Buscamos primero la categoría del modelo
    for (var i = 0; i < catalogos.modelos.length; i++) {
        if (catalogos.modelos[i].id == idMod) {
            idCat = catalogos.modelos[i].categoria;
            break;
        }
    }
    
    // Buscamos el nombre de esa categoría
    for (var j = 0; j < catalogos.categorias.length; j++) {
        if (catalogos.categorias[j].id == idCat) {
            return catalogos.categorias[j].nombre;
        }
    }
    return "-";
}

function obtenerNombreUbi(id) {
    for (var i = 0; i < catalogos.ubicaciones.length; i++) {
        if (catalogos.ubicaciones[i].id == id) {
            return catalogos.ubicaciones[i].nombre;
        }
    }
    return id;
}

function limpiarCamposRegistro() {
    document.getElementById("reg-nombre").value = "";
    document.getElementById("reg-apellidos").value = "";
    document.getElementById("reg-login").value = "";
    document.getElementById("reg-password").value = "";
}

function verDetalle(id) {
    idRecursoEnEdicion = id;
    navegarA('vista-recurso');
    console.log("Cargando historial del recurso ID:", id);

    var recurso = recursos.find(function (item){
        return item.id==id;
    });
    
    if(recurso) {
        document.getElementById("f-numserie").value = recurso.numero_serie;
        document.getElementById("f-estado").value = recurso.estado;
        document.getElementById("f-ubicacion").value = recurso.ubicacion;
        
        var mod = catalogos.modelos.find(function(m){ // Importante: para que el modelo se marque, primero hay que cargar la categoría
            return m.id == recurso.modelo; 
        }); 
        
        document.getElementById("f-categoria").value = mod.categoria;
        actualizarModelosFicha(); // Esto rellena el select de modelos
        document.getElementById("f-modelo").value = recurso.modelo;
    }
    // Pedimos las reservas al servidor
    rest.get("/api/recursos/" + id + "/reservas", function(status, lista) {
        if (status == 200) {
            pintarReservas(lista);
        }
    });

    // Pedimos las reseñas al servidor
    rest.get("/api/recursos/" + id + "/resenyas", function(status, lista) {
        if (status == 200) {
            pintarResenyas(lista);
        }
    });
}

function pintarReservas(lista) {
    var body = document.getElementById("tabla-reservas-body");
    body.innerHTML = "";

    for (var i = 0; i < lista.length; i++) {
        var res = lista[i];
        var fila = body.insertRow();
        
        // Datos básicos
        fila.insertCell(0).innerText = obtenerNombreSanitario(res.sanitario);
        fila.insertCell(1).innerText = res.horas_estimadas;
        fila.insertCell(2).innerText = res.fecha_peticion;
        fila.insertCell(3).innerText = res.fecha_inicio;
        fila.insertCell(4).innerText = res.fecha_fin;

        // Lógica de colores
        if (res.fecha_fin != null) {
            // Blanco: reserva finalizada
            fila.style.backgroundColor = "white";
        } else if (res.fecha_inicio == null) {
            // Verde: pendiente de que se libere el recurso
            fila.style.backgroundColor = "#d4edda"; 
        } else {
            // Está en uso (fecha_inicio existe pero fecha_fin no)
            // Comprobamos si se han superado las horas estimadas
            var ahora = new Date();
            var inicio = new Date(res.fecha_inicio);
            var difHoras = (ahora - inicio) / (1000 * 60 * 60);

            if (difHoras > res.horas_estimadas) {
                fila.style.backgroundColor = "#f8d7da"; // Rojo: superado
            } else {
                fila.style.backgroundColor = "#cce5ff"; // Azul: en uso normal
            }
        }
    }
}


function pintarResenyas(lista) {
    var body = document.getElementById("tabla-resenyas-body");
    body.innerHTML = "";

    for (var i = 0; i < lista.length; i++) {
        var rese = lista[i];
        var fila = body.insertRow();
        
        fila.insertCell(0).innerText = rese.fecha;
        fila.insertCell(1).innerText = obtenerNombreSanitario(rese.sanitario);
        fila.insertCell(2).innerText = rese.valor + " / 5";
        fila.insertCell(3).innerText = rese.descripcion;
    }
}

function obtenerNombreSanitario(idSan) {
    for (var i = 0; i < listaSanitarios.length; i++) {
        var s = listaSanitarios[i];
        
        if (s.id == idSan) {
            return s.nombre + " " + s.apellidos;
        }
    }
    
    // Si por alguna razón no lo encuentra, devolvemos el ID por seguridad
    return "ID: " + idSan;
}

function borrarRecurso(id){
    var recurso = recursos.find(function(item){
        return item.id == id;
    });

    if(recurso){
       var nombreMod = obtenerNombreMod(recurso.modelo)
        console.log("Borrando recurso:" + nombreMod + "cuya serie es " + recurso.numero_serie)
        rest.delete("/api/recursos/" + id, function(status){
            if(status==200){
                buscarRecursos(); // Se actualiza la tabla
            }
        });
    }
}

var URL_MINISTERIO = "https://undefined.ua.es/telemedicina/api/datos";
var ID_AREA = 18; 

var NOMBRES_AREAS = ["", "Alergología", "Anestesiología", "Cardiología", "Cirugía General",
    "Dermatología", "Aparato Digestivo", "Endocrinología", "Ginecología", "Hematología",
    "Medicina Interna", "Neumología", "Neurología", "Oftalmología", "Oncología",
    "Pediatría", "Psiquiatría", "Traumatología", "Urología"];

// Fecha de hoy en formato YYYY-MM-D
function fechaHoy() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, "0"); // getMonth() va de 0 a 11
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}

function buscarSanitario(idSan) {
    for (var i = 0; i < listaSanitarios.length; i++) {
        if (listaSanitarios[i].id == idSan) {
            return listaSanitarios[i];
        }
    }
    return { nombre: "", apellidos: "" };
}

function construirEnvio() {
    var datos = [];
    var resp = rest.get("/api/recursos"); 
    if (resp.status != 200) {
        return null;
    }
    var todosRecursos = resp.response;

    for (var i = 0; i < todosRecursos.length; i++) {
        var recurso = todosRecursos[i];
        var respReservas = rest.get("/api/recursos/" + recurso.id + "/reservas");
        if (respReservas.status != 200) continue;

        var reservas = respReservas.response;
        for (var j = 0; j < reservas.length; j++) {
            var san = buscarSanitario(reservas[j].sanitario);
            datos.push({
                "nombre": san.nombre,
                "apellidos": san.apellidos,
                "categoría": obtenerNombreCat(recurso.modelo), 
                "horas_estimadas": String(reservas[j].horas_estimadas),
                "fec_pet": reservas[j].fecha_peticion,
                "fec_ini": reservas[j].fecha_inicio,
                "fecha_fin": reservas[j].fecha_fin
            });
        }
    }

    return { id_area: ID_AREA, fecha: fechaHoy(), datos: datos };
}

function enviarMinisterio() {
    var envio = construirEnvio();
    if (envio == null) {
        alert("No se han podido leer las reservas");
        return;
    }

    console.log("Datos a enviar:", envio);

    rest.post(URL_MINISTERIO, envio, function (status) {
        if (status >= 200 && status < 300) {
            alert("Reservas enviadas correctamente");
            cargarRanking();
        } else {
            alert("Error al enviar al Ministerio (código " + status + ")");
        }
    });
}

function cargarRanking() {
    rest.get(URL_MINISTERIO, function (status, envios) {
        if (status != 200) {
            console.log("Error al cargar el ranking:", status);
            return;
        }

        // 1. Sumamos las reservas de todos los envíos de cada área
        //    totales[id_area] = nº de reservas
        var totales = {};
        var suma=0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (!envio.datos) continue;   // por si algún envío no trae datos

            if (!totales[envio.id_area]) {
                totales[envio.id_area] = 0;
            }
            totales[envio.id_area] += envio.datos.length;
            suma+=envio.datos.length;
        }
        console.log("Suma de envíos: " + suma);

        // 2. Preparamos una fila por cada área (de la 1 a la 18)
        var ranking = [];
        for (var id = 1; id <= 18; id++) {
            var total = 0;
            if (totales[id]) {
                total = totales[id];
            }
            ranking.push({ nombre: NOMBRES_AREAS[id], total: total });
        }

        // 3. De más a menos reservas
        ranking.sort(function (a, b) { return b.total - a.total; });

        // 4. Pintamos la tabla
        var tbody = document.getElementById("tabla-ranking-body");
        tbody.innerHTML = "";
        for (var k = 0; k < ranking.length; k++) {
            tbody.innerHTML +=
                "<tr>" +
                    "<td>" + (k + 1) + "</td>" +
                    "<td>" + ranking[k].nombre + "</td>" +
                    "<td>" + ranking[k].total + "</td>" +
                "</tr>";
        }
    });
}

function ejercicio() {
    rest.get(URL_MINISTERIO, function (status, envios) {
        if (status != 200) {
            console.log("Error al cargar el ranking:", status);
            return;
        }

        // 1. Sumamos las reservas de todos los envíos de cada área
        //    totales[id_area] = nº de reservas
        var totales = {};
        var suma=0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (!envio.datos) continue;   // por si algún envío no trae datos

            if (!totales[envio.id_area]) {
                totales[envio.id_area] = 0;
            }
            totales[envio.id_area] += envio.datos.length;
            suma+=envio.datos.length;
        }
        console.log("Suma de envíos: " + suma);

        // 2. Preparamos una fila por cada área (de la 1 a la 18)
        var ranking = [];
        for (var id = 1; id <= 18; id++) {
            var total = 0;
            if (totales[id]) {
                total = totales[id];
            }
            var porcentaje = ((total/suma).toFixed(2))*100;
            ranking.push({ nombre: NOMBRES_AREAS[id], total: total, p: porcentaje });
        }

        // 3. De más a menos reservas
        ranking.sort(function (a, b) { return b.total - a.total; });

        // 4. Pintamos la tabla
        var tbody = document.getElementById("tabla-ranking-body2");
        tbody.innerHTML = "";
        for (var k = 0; k < ranking.length; k++) {
            tbody.innerHTML +=
                "<tr>" +
                    "<td>" + (k + 1) + "</td>" +
                    "<td>" + ranking[k].nombre + "</td>" +
                    "<td>" + ranking[k].total + "</td>" +
                    "<td>" + ranking[k].p + "</td>" +
                "</tr>";
        }
    });
}

/*
Muestra cuántas reservas del área 18 tienen fecha_fin a null, y qué porcentaje representan sobre las reservas del 
área 18.
*/


