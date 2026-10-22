// =====================================================================
//  EJERCICIOS DE EXAMEN: DATOS DEL MINISTERIO
// =====================================================================
//
//  CÓMO USARLO
//  1. Guarda este archivo en la carpeta cliente_rest/ (junto a main_gestor.js).
//  2. En index_gestor.html, añade esta línea DEBAJO de la de main_gestor.js:
//         <script src="ejercicios.js"></script>
//  3. Dentro de <div id="vista-inicio">, añade los botones y el párrafo
//     del resultado (valores de ejemplo, cámbialos si quieres):
//
//     <h4>Ejercicios</h4>
//     <button onclick="ej1(3)">1</button>
//     <button onclick="ej2()">2</button>
//     <button onclick="ej3('Termómetro')">3</button>
//     <button onclick="ej4('Paula', 'Artes Rodriguez')">4</button>
//     <button onclick="ej5(18)">5</button>
//     <button onclick="ej6()">6</button>
//     <button onclick="ej7()">7</button>
//     <button onclick="ej8(18, 'Termómetro')">8</button>
//     <button onclick="ej9(18, '2026-10-18')">9</button>
//     <button onclick="ej10()">10</button>
//     <button onclick="ej11(3)">11</button>
//     <button onclick="ej12('Termómetro')">12</button>
//     <button onclick="ej13(18, 'Paula', 'Artes Rodriguez')">13</button>
//     <button onclick="ej14()">14</button>
//     <p id="resultado"></p>
//
//  Usa cosas que ya están en main_gestor.js:
//     URL_MINISTERIO, ID_AREA (= 18, mi área), NOMBRES_AREAS y reservaValida()
//
//  RECORDATORIO
//  - envios         = array de envíos ("sobres")
//  - envio.id_area  = área del envío       -> se mira en el bucle de FUERA
//  - envio.fecha    = fecha del envío      -> se mira en el bucle de FUERA
//  - envio.datos    = array de reservas    -> se recorre en el bucle de DENTRO
//
//  ESTADOS DE UNA RESERVA
//  - Pendiente  : fec_ini = null      y fecha_fin = null
//  - En uso     : fec_ini con fecha   y fecha_fin = null
//  - Finalizada : fecha_fin con fecha
// =====================================================================


// =====================================================================
//  FUNCIONES AUXILIARES
// =====================================================================

// Pide los datos al Ministerio y, cuando llegan, ejecuta hacer(envios).
// Solo sirve para no repetir el rest.get en cada ejercicio
// (en el ejercicio 1 tienes también la versión sin ella).
function conDatosMinisterio(hacer) {
    rest.get(URL_MINISTERIO, function (status, envios) {
        if (status != 200) {
            alert("Error al consultar al Ministerio (código " + status + ")");
            return;
        }
        hacer(envios);
    });
}

// Escribe el resultado en <p id="resultado">
function mostrar(texto) {
    document.getElementById("resultado").innerText = texto;
}

// Solo es válida la categoría que viene en la clave CON tilde: "categoría".
// Las reservas que la mandan como "categoria" (sin tilde) no tienen categoría válida
// y devuelven undefined, así que no coinciden con ninguna categoría.
// OJO: con tilde hay que escribirla entre comillas y corchetes: reserva["categoría"]
function categoriaDe(reserva) {
    return reserva["categoría"];
}

// Porcentaje con 2 decimales, sin dividir entre 0
function porcentaje(parte, total) {
    if (total == 0) {
        return "0.00 %";
    }
    return (parte / total * 100).toFixed(2) + " %";
}

// Estados de una reserva ( != null vale tanto para null como para undefined )
function estaFinalizada(r) {
    return r.fecha_fin != null;
}
function estaEnUso(r) {
    return r.fec_ini != null && r.fecha_fin == null;
}
function estaPendiente(r) {
    return r.fec_ini == null && r.fecha_fin == null;
}

// Convierte la fecha del Ministerio a "YYYY-MM-DD" en hora de España.
// El Ministerio la devuelve en hora UTC: "2026-10-17T22:00:00.000Z"
// es en realidad el 18/10/2026 a las 00:00 en España.
function fechaLocal(iso) {
    var d = new Date(iso);
    var mes = String(d.getMonth() + 1).padStart(2, "0");   // getMonth() va de 0 a 11
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}


// =====================================================================
//  1. ENVÍOS DE UN ÁREA ESPECÍFICA
//  Cuenta SOBRES -> contador++ en el bucle de FUERA (no hace falta el de dentro)
// =====================================================================
function ej1(idArea) {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            if (envios[i].id_area == idArea) {
                contador++;
            }
        }
        mostrar("Envíos del área " + NOMBRES_AREAS[idArea] + ": " + contador);
    });
}

// Misma solución SIN la función auxiliar (como lo escribirías en el examen)
function ej1SinPlantilla(idArea) {
    rest.get(URL_MINISTERIO, function (status, envios) {
        if (status != 200) {
            alert("Error al consultar al Ministerio (código " + status + ")");
            return;
        }
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            if (envios[i].id_area == idArea) {
                contador++;
            }
        }
        document.getElementById("resultado").innerText =
            "Envíos del área " + NOMBRES_AREAS[idArea] + ": " + contador;
    });
}


// =====================================================================
//  2. RESERVAS FINALIZADAS DE MI ÁREA
//  La condición mira la RESERVA -> hace falta el bucle de DENTRO
// =====================================================================
function ej2() {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != ID_AREA) continue;   // solo mi área
            if (!envio.datos) continue;               // envío sin reservas

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (reservaValida(reserva) && estaFinalizada(reserva)) {
                    contador++;
                }
            }
        }
        mostrar("Reservas finalizadas de " + NOMBRES_AREAS[ID_AREA] + ": " + contador);
    });
}


// =====================================================================
//  3. RESERVAS DE UNA CATEGORÍA ESPECÍFICA (de todas las áreas)
//  OJO: el nombre tiene que coincidir exacto ("Termómetro" no es "Termometros")
// =====================================================================
function ej3(categoria) {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (reservaValida(reserva) && categoriaDe(reserva) == categoria) {
                    contador++;
                }
            }
        }
        mostrar("Reservas de la categoría " + categoria + ": " + contador);
    });
}


// =====================================================================
//  4. RESERVAS DE UN SANITARIO ESPECÍFICO (de todas las áreas)
//  Se compara en minúsculas para que "Maria Lopez" y "maria lopez" sean iguales
// =====================================================================
function ej4(nombre, apellidos) {
    conDatosMinisterio(function (envios) {
        var buscado = (nombre + " " + apellidos).toLowerCase();
        var contador = 0;

        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                var completo = (reserva.nombre + " " + reserva.apellidos).toLowerCase();
                if (completo == buscado) {
                    contador++;
                }
            }
        }
        mostrar("Reservas de " + nombre + " " + apellidos + ": " + contador);
    });
}


// =====================================================================
//  5. HORAS ESTIMADAS DE UN ÁREA ESPECÍFICA
//  OJO: unos envían las horas como número (2) y otros como texto ("2")
//       -> parseInt(..., 10) para poder sumarlas (el 10 = base decimal)
// =====================================================================
function ej5(idArea) {
    conDatosMinisterio(function (envios) {
        var horas = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != idArea) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                var h = parseInt(reserva.horas_estimadas, 10);
                if (!isNaN(h)) {          // "", null o texto sin número -> NaN, no se suma
                    horas += h;
                }
            }
        }
        mostrar("Horas estimadas de " + NOMBRES_AREAS[idArea] + ": " + horas);
    });
}


// =====================================================================
//  6. RESERVAS PENDIENTES DE MI ÁREA (sin fecha de inicio ni de fin)
// =====================================================================
function ej6() {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != ID_AREA) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (reservaValida(reserva) && estaPendiente(reserva)) {
                    contador++;
                }
            }
        }
        mostrar("Reservas pendientes de " + NOMBRES_AREAS[ID_AREA] + ": " + contador);
    });
}


// =====================================================================
//  7. RESERVAS EN USO DE MI ÁREA (con fecha de inicio y sin fecha de fin)
// =====================================================================
function ej7() {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != ID_AREA) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (reservaValida(reserva) && estaEnUso(reserva)) {
                    contador++;
                }
            }
        }
        mostrar("Reservas en uso de " + NOMBRES_AREAS[ID_AREA] + ": " + contador);
    });
}


// =====================================================================
//  8. RESERVAS DE UNA CATEGORÍA ESPECÍFICA EN UN ÁREA
//  Es el ejercicio 3 + la condición del área (bucle de fuera)
// =====================================================================
function ej8(idArea, categoria) {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != idArea) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (reservaValida(reserva) && categoriaDe(reserva) == categoria) {
                    contador++;
                }
            }
        }
        mostrar("Reservas de " + categoria + " en " + NOMBRES_AREAS[idArea] + ": " + contador);
    });
}


// =====================================================================
//  9. ENVÍOS DE UN ÁREA EN UNA FECHA
//  fecha en formato "YYYY-MM-DD", por ejemplo "2026-10-18"
//  OJO: se usa fechaLocal() porque el Ministerio devuelve la fecha en UTC
// =====================================================================
function ej9(idArea, fecha) {
    conDatosMinisterio(function (envios) {
        var contador = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area == idArea && fechaLocal(envio.fecha) == fecha) {
                contador++;
            }
        }
        mostrar("Envíos de " + NOMBRES_AREAS[idArea] + " el " + fecha + ": " + contador);
    });
}


// =====================================================================
//  10. PORCENTAJE DE RESERVAS FINALIZADAS DE MI ÁREA
//  Dos contadores: el total de mi área y las finalizadas de mi área
// =====================================================================
function ej10() {
    conDatosMinisterio(function (envios) {
        var total = 0;
        var finalizadas = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != ID_AREA) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                total++;
                if (estaFinalizada(reserva)) {
                    finalizadas++;
                }
            }
        }
        mostrar("Finalizadas de " + NOMBRES_AREAS[ID_AREA] + ": " + finalizadas + " de " + total +
                " (" + porcentaje(finalizadas, total) + ")");
    });
}


// =====================================================================
//  11. PORCENTAJE DE ENVÍOS DE UN ÁREA (sobre todos los envíos)
//  El total de envíos es simplemente envios.length
// =====================================================================
function ej11(idArea) {
    conDatosMinisterio(function (envios) {
        var delArea = 0;
        for (var i = 0; i < envios.length; i++) {
            if (envios[i].id_area == idArea) {
                delArea++;
            }
        }
        mostrar("Envíos de " + NOMBRES_AREAS[idArea] + ": " + delArea + " de " + envios.length +
                " (" + porcentaje(delArea, envios.length) + ")");
    });
}


// =====================================================================
//  12. PORCENTAJE DE RESERVAS DE UNA CATEGORÍA (sobre todas las reservas)
// =====================================================================
function ej12(categoria) {
    conDatosMinisterio(function (envios) {
        var total = 0;
        var deLaCategoria = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                total++;
                if (categoriaDe(reserva) == categoria) {
                    deLaCategoria++;
                }
            }
        }
        mostrar("Reservas de " + categoria + ": " + deLaCategoria + " de " + total +
                " (" + porcentaje(deLaCategoria, total) + ")");
    });
}


// =====================================================================
//  13. PORCENTAJE DE RESERVAS DE UN SANITARIO EN UN ÁREA
//  Total = reservas de ESE área; parte = las de ese sanitario en ese área
// =====================================================================
function ej13(idArea, nombre, apellidos) {
    conDatosMinisterio(function (envios) {
        var buscado = (nombre + " " + apellidos).toLowerCase();
        var total = 0;
        var delSanitario = 0;

        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != idArea) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                total++;
                var completo = (reserva.nombre + " " + reserva.apellidos).toLowerCase();
                if (completo == buscado) {
                    delSanitario++;
                }
            }
        }
        mostrar(nombre + " " + apellidos + " en " + NOMBRES_AREAS[idArea] + ": " +
                delSanitario + " de " + total + " (" + porcentaje(delSanitario, total) + ")");
    });
}


// =====================================================================
//  14. PORCENTAJE DE RESERVAS PENDIENTES DE MI ÁREA
// =====================================================================
function ej14() {
    conDatosMinisterio(function (envios) {
        var total = 0;
        var pendientes = 0;
        for (var i = 0; i < envios.length; i++) {
            var envio = envios[i];
            if (envio.id_area != ID_AREA) continue;
            if (!envio.datos) continue;

            for (var j = 0; j < envio.datos.length; j++) {
                var reserva = envio.datos[j];
                if (!reservaValida(reserva)) continue;

                total++;
                if (estaPendiente(reserva)) {
                    pendientes++;
                }
            }
        }
        mostrar("Pendientes de " + NOMBRES_AREAS[ID_AREA] + ": " + pendientes + " de " + total +
                " (" + porcentaje(pendientes, total) + ")");
    });
}


// =====================================================================
//  ERRORES TÍPICOS
// =====================================================================
//  - Contar envíos (contador++ fuera) no es lo mismo que contar reservas
//    (contador++ dentro, o envio.datos.length).
//  - Comprobar siempre que envio.datos existe antes de recorrerlo.
//  - Hay reservas vacías ({}) o con "nombre": "" -> reservaValida().
//  - Solo vale la clave "categoría" (con tilde) -> categoriaDe().
//    Las reservas con "categoria" (sin tilde) no cuentan para ninguna categoría.
//  - Las horas vienen como número o como texto -> parseInt(..., 10).
//  - Porcentaje: multiplicar por 100 y no dividir entre 0 -> porcentaje().
//  - La fecha del envío está en UTC -> fechaLocal() antes de compararla.
//  - Usar == (no ===) al comparar id_area, por si viene como texto ("18").
// =====================================================================
