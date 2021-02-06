'use strict';

const express = require('express');
const api = express.Router();
const bodyParser = require('body-parser');
const databaseConfig = require('../Helper/dataBaseConfig');
const proxy = require('../Helper/proxy');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const { MongoNetworkError } = require('mongodb');
const randomToken = require('random-token');

api.use(bodyParser.urlencoded({extended: false}))//necesario para parsear las respuestas en el body

api.post('/crearGrupo', async(req,res) => {
    var nombre = req.body.nombre;
    var ahorro = req.body.ahorro;
    var usuarioToken = req.body.usuarioToken;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([nombre, ahorro, usuarioToken])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);
                
                const usuarioCreador = await Usuario.findOne({token: usuarioToken})
                var grupoToken = randomToken(16)
                const nuevoGrupo = new Grupo({
                    token: grupoToken,
                    nombre: nombre,
                    ahorro: ahorro
                });
                const grupoCreado = await nuevoGrupo.save();
                usuarioCreador.grupo = grupoToken;
                const usuarioEditado = await usuarioCreador.save();
                const miembros = await Usuario.find({grupo: grupoToken});
                const categorias = await Categoria.find({grupo: grupoToken});

                var grupo = {
                    "token": grupoCreado.token,
                    "nombre": grupoCreado.nombre,
                    "ahorro": grupoCreado.ahorro,
                    "periodoActivo": grupoCreado.periodoActivo,
                    "miembros": miembros,
                    "categorias": categorias,
                    "periodos": []
                }

                res.status(200).json({grupo});
            } catch(err) {
                console.log(err);
				res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/unirGrupo', async(req,res) => {
    var grupoToken = req.body.grupoToken;
    var usuarioToken = req.body.usuarioToken;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([grupoToken, usuarioToken])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);
                const Periodo = mongoose.model('Periodo', databaseConfig.periodoSchema);
                const Movmiento = mongoose.model('Movimiento', databaseConfig.movimientoSchema);

                const grupoParaAnadir = await Grupo.findOne({token: grupoToken});
                const usuarioParaUnir = await Usuario.findOne({token: usuarioToken});
                usuarioParaUnir.grupo = grupoToken;
                const usuarioUnido = await usuarioParaUnir.save();

                const miembros = await Usuario.find({grupo: grupoParaAnadir.token});
                const categorias = await Categoria.find({grupo: grupoParaAnadir.token});

                var periodos = []
                const periodosGrupo = await Periodo.find({grupo: grupoUsuario.token});
                for(var i=0;i<periodosGrupo.length;i++){
                    var movimientos = []
                    const movimiento = await Movmiento.find({periodo: periodosGrupo[i].token});
                    for(var j=0;j<movimiento.length;j++){
                        const categoria = await Categoria.findOne({token: movimiento[j].categoria});
                        movimientos.push({
                            "token":movimiento[j].token,
                            "descripcion":movimiento[j].descripcion,
                            "valor":movimiento[j].valor,
                            "categoria":categoria,
                            "fecha":movimiento[j].fecha,
                            "tipo":movimiento[j].tipo,
                            "periodo":movimiento[j].periodo,
                            "grupo":movimiento[j].grupo
                        });
                    }
                    periodos.push({
                        "token":periodosGrupo[i].token,
                        "titulo":periodosGrupo[i].titulo,
                        "ahorroEstimado":periodosGrupo[i].ahorroEstimado,
                        "fechaInicio": periodosGrupo[i].fechaInicio,
                        "fechaFin":periodosGrupo[i].fechaFin,
                        "ahorroFinal":periodosGrupo[i].ahorroFinal,
                        "movimientos": movimientos
                    });
                }


                var grupo = {
                    "token": grupoParaAnadir.token,
                    "nombre": grupoParaAnadir.nombre,
                    "ahorro": grupoParaAnadir.ahorro,
                    "periodoActivo": grupoParaAnadir.periodoActivo,
                    "miembros": miembros,
                    "categorias": categorias,
                    "periodos": periodos
                }


                res.status(200).json({grupo});
                
            } catch(err) {
                console.log(err);
				res.status(400).json({"reason":"Este ID no corresponde a ningún grupo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/getGrupo', async(req,res) => {
    var usuarioToken = req.body.usuarioToken;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([usuarioToken])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);
                const Periodo = mongoose.model('Periodo', databaseConfig.periodoSchema);
                const Movmiento = mongoose.model('Movimiento', databaseConfig.movimientoSchema);
                
                const usuario = await Usuario.findOne({token: usuarioToken});
                const grupoUsuario = await Grupo.findOne({token: usuario.grupo});
                const miembros = await Usuario.find({grupo: grupoUsuario.token});
                const categorias = await Categoria.find({grupo: grupoUsuario.token});


                var periodos = []
                const periodosGrupo = await Periodo.find({grupo: grupoUsuario.token});
                for(var i=0;i<periodosGrupo.length;i++){
                    var movimientos = []
                    const movimiento = await Movmiento.find({periodo: periodosGrupo[i].token});
                    for(var j=0;j<movimiento.length;j++){
                        const categoria = await Categoria.findOne({token: movimiento[j].categoria});
                        movimientos.push({
                            "token":movimiento[j].token,
                            "descripcion":movimiento[j].descripcion,
                            "valor":movimiento[j].valor,
                            "categoria":categoria,
                            "fecha":movimiento[j].fecha,
                            "tipo":movimiento[j].tipo,
                            "periodo":movimiento[j].periodo,
                            "grupo":movimiento[j].grupo
                        });
                    }
                    periodos.push({
                        "token":periodosGrupo[i].token,
                        "titulo":periodosGrupo[i].titulo,
                        "ahorroEstimado":periodosGrupo[i].ahorroEstimado,
                        "fechaInicio": periodosGrupo[i].fechaInicio,
                        "fechaFin":periodosGrupo[i].fechaFin,
                        "ahorroFinal":periodosGrupo[i].ahorroFinal,
                        "movimientos": movimientos
                    });
                }


                var grupo = {
                    "token": grupoUsuario.token,
                    "nombre": grupoUsuario.nombre,
                    "ahorro": grupoUsuario.ahorro,
                    "periodoActivo": grupoUsuario.periodoActivo,
                    "miembros": miembros,
                    "categorias": categorias,
                    "periodos": periodos
                }

                res.status(200).json({grupo});

                
            } catch(err) {
                console.log(err);
				res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/abandonarGrupo', async(req,res) => {
    var usuarioToken = req.body.usuarioToken;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([usuarioToken])){
            try{
                const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
                
                const usuarioEditable = await Usuario.findOne({token: usuarioToken});
                usuarioEditable.grupo = "";
                const usuario = await usuarioEditable.save();

                res.status(200).json({usuario});

            } catch(err) {
				res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/addCategoria', async(req,res) => {
    var titulo = req.body.titulo;
    var imagen = req.body.imagen;
    var tipo = req.body.tipo;
    var grupo = req.body.grupo;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([titulo, imagen, tipo, grupo])){
            try{
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);
                const nuevaCategoria = new Categoria({
                    token: randomToken(16),
                    grupo: grupo,
                    titulo: titulo,
                    imagen: imagen,
                    tipo: tipo
                });
                const categoria = await nuevaCategoria.save()
                res.status(200).json({categoria});
            } catch(err) {
				res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/editarCategoria', async(req,res) => {
    var titulo = req.body.titulo;
    var imagen = req.body.imagen;
    var tipo = req.body.tipo;
    var grupo = req.body.grupo;
    var token = req.body.token;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([titulo, imagen, tipo, grupo])){
            try{
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);

                const categoriaParaEditar = await Categoria.findOne({token: token});
                categoriaParaEditar.titulo = titulo;
                categoriaParaEditar.imagen = imagen;
                categoriaParaEditar.tipo = tipo;

                const categoria = await categoriaParaEditar.save()
                res.status(200).json({categoria});
            } catch(err) {
				res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
			};
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }

    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

module.exports = api;