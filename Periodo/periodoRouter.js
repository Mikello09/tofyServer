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

api.post('/crearPeriodo', async(req,res) => {
    var titulo = req.body.titulo;
    var ahorroEstimado = req.body.ahorroEstimado;
    var fechaInicio = req.body.fechaInicio;
    var grupo = req.body.grupo;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([titulo, ahorroEstimado, fechaInicio, grupo])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Periodo = mongoose.model('Periodo', databaseConfig.periodoSchema);

                const tokenPeriodo = randomToken(16);

                const nuevoPeriodo = new Periodo({
                    token: tokenPeriodo,
                    titulo: titulo,
                    ahorroEstimado: ahorroEstimado,
                    fechaInicio: fechaInicio,
                    fechaFin: "",
                    grupo: grupo
                });
                const periodoEditado = await nuevoPeriodo.save();

                const grupoAEditar = await Grupo.findOne({token: grupo});
                grupoAEditar.periodoActivo = tokenPeriodo;
                const grupoEditado = await grupoAEditar.save();

                var periodo = {
                    "token": periodoEditado.token,
                    "titulo": periodoEditado.titulo,
                    "ahorroEstimado": periodoEditado.ahorroEstimado,
                    "fechaInicio": periodoEditado.fechaInicio,
                    "fechaFin": periodoEditado.fechaFin,
                    "movimientos": []
                }

                res.status(200).json({periodo});

            }
            catch(err){
                console.log(err);
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
            }
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/finalizarPeriodo', async(req,res) => {
    var periodoToken = req.body.periodoToken;
    var grupo = req.body.grupo;
    var fechaFin = req.body.fechaFin;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([periodoToken, grupo, fechaFin])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Periodo = mongoose.model('Periodo', databaseConfig.periodoSchema);

                const periodoAEdtiar = await Periodo.findOne({token: periodoToken});
                periodoAEdtiar.fechaFin = fechaFin;
                const periodoEditado = await periodoAEdtiar.save();

                const grupoAEditar = await Grupo.findOne({token: grupo});
                grupoAEditar.periodoActivo = "";
                const grupoEditado = await grupoAEditar.save();

                var periodo = {
                    "token": periodoEditado.token,
                    "titulo": periodoEditado.titulo,
                    "ahorroEstimado": periodoEditado.ahorroEstimado,
                    "fechaInicio": periodoEditado.fechaInicio,
                    "fechaFin": periodoEditado.fechaFin,
                    "movimientos": []
                }

                res.status(200).json({periodo});
            }
            catch(err){
                console.log(err);
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
            }
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/addMovimiento', async(req,res) => {
    var descripcion = req.body.descripcion;
    var categoria = req.body.categoria;
    var valor = req.body.valor;
    var tipo = req.body.tipo;
    var fecha = req.body.fecha;
    var periodo = req.body.periodo;
    var grupo = req.body.grupo;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([descripcion, categoria, valor, tipo, fecha, periodo, grupo])){
            try{
                
                const Movmiento = mongoose.model('Movimiento', databaseConfig.movimientoSchema);
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);

                const nuevoMovimiento = new Movmiento({
                    token: randomToken(16),
                    descripcion: descripcion,
                    valor: valor,
                    categoria: categoria,
                    fecha: fecha,
                    tipo: tipo,
                    periodo: periodo,
                    grupo: grupo
                });

                const movimientoGuardado = await nuevoMovimiento.save();

                const categoriaObtenida = await Categoria.findOne({token:categoria});

                var movimiento = {
                    "token":movimientoGuardado.token,
                    "descripcion":movimientoGuardado.descripcion,
                    "valor":movimientoGuardado.valor,
                    "categoria":categoriaObtenida,
                    "fecha":movimientoGuardado.fecha,
                    "tipo":movimientoGuardado.tipo,
                    "periodo":movimientoGuardado.periodo,
                    "grupo":movimientoGuardado.grupo
                };

                res.status(200).json({movimiento});

            }
            catch(err){
                console.log(err);
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
            }
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

module.exports = api;