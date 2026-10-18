// Librería RPC para el servidor
// Versión 2.0 Soporta procedimientos asíncronos en el servidor

const express = require("express");
const cors = require("cors");

function debug(...args) {
	if (module.exports.debug) console.debug("[RPC]", ...args);
}

class RPCApp {
	constructor() {
		this.procedures = {};
	}

	register(async, name, fnct) {
		if (typeof async !== "boolean") {
			fnct = name;
			name = async;
			async = false;
		}
		if (typeof name === "function") { // con una función nombrada
			fnct = name;
			name = fnct.name;
		}
		debug("register:", name, "async:", async);
		this.procedures[name] = { fnct, async };
	}

	registerSync(name, fnct) { // registro de función síncrona (return)
		this.register(false, name, fnct)
	}

	registerAsync(name, fnct) { // registro de función asíncrona (con callback)
		this.register(true, name, fnct);
	}

}

class RPCServer {
	constructor(port, callback) {
		this.apps = {};
		if (!port || typeof port === "function") port = 3501;
		var app = express();
		app.get("/", function (req, res) {
			res.json("RPC server");
		});
		app.use("/RPC", cors());
		app.use("/RPC", express.json({ strict: false }));
		app.post("/RPC/:app/:procedure", (req, res) => {
			var appName = req.params.app;
			var app = this.apps[appName];
			if (!app) {
				console.error("No existe la app:", appName);
				res.status(404).json("No existe la app: " + appName);
				return;
			}
			var procedureName = req.params.procedure;
			var procedure = app.procedures[procedureName];
			if (!procedure) {
				console.error("No existe el procedimiento:", procedureName);
				res.status(404).json("No existe el procedimiento: " + procedureName);
				return;
			}

			var params = req.body;
			debug("call:", appName + ": " + procedureName + "(", ...params, ")");
			if (procedure.async) {
				procedure.fnct(...params, end);
			} else {
				end(procedure.fnct(...params));
			}

			function end(result) {
				setTimeout(() => {
					debug("response:", appName + ": " + procedureName + "(", ...params, ") -> ", result);
					res.json(result);
				}, module.exports.delay);
			}
		});
		app.listen(port, callback);
	}

	createApp(name) {
		debug("app:", name);
		return this.apps[name] = new RPCApp();
	}
}

module.exports = {
	debug: false,
	server: function (port, callback) { return new RPCServer(port, callback); },
	delay: 0
}

/*
1. Crear proyecto 
cd C:\Users\Usuario\Desktop
cordova create ProyectoExamen com.examen.app AppExamen
cd ProyectoExamen
cordova platform add android

2. Meter la web en www
1. Borra lo que trae www de ejemplo: index.html, css, js e img.
2. Copia dentro de www los archivos que os den (html, js, css).
3. La página principal tiene que llamarse index.html. Si se llama de otra forma (por ejemplo
index_sanitario.html), renómbrala

3. Cambios en index.html
Añade cordova.js como primer script, antes de los demás. Es el que da acceso a los plugins
(NFC) y lanza el evento deviceready. El archivo lo genera Cordova al compilar: no hay que
copiarlo.
<script src="cordova.js"></script>
<script src="rest.js"></script>
<script src="rpc.js"></script>
<script src="main.js"></script>
Si el HTML no la tiene, añade en el <head> la etiqueta para que se vea bien en el móvil:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

4. Archivo config.xml
Copiar y pegar el  el config.xml 

5. Cambiar IP
Cambiar IP_SERVIDOR_MOVIL, SERVIDOR, app en main_sanitario.js

6. nfc
Copiar y pegar desde línea 14 hasta 96 de nfc.js

*/