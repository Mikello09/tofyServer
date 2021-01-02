'use strict';

const express = require('express');
const api = express.Router();
const bodyParser = require('body-parser');
const databaseConfig = require('../Helper/dataBaseConfig');
const proxy = require('../Helper/proxy');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const { MongoNetworkError } = require('mongodb');

api.use(bodyParser.urlencoded({extended: false}))//necesario para parsear las respuestas en el body


api.post('/getAllClaves', (req,res) => {
	var usuarioToken = req.body.token;
	if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([usuarioToken])){
            const Clave = mongoose.model('Clave', databaseConfig.clavesSchema);
            Clave.find({
                tokenUsuario: usuarioToken
            })
            .then(claves => {
                res.status(200).json({claves});
            })
            .catch(err => {
                res.status(500).json({"reason":"Error en la obtencion de los datos"});
            })
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
			
	}else {
		res.status(401).json({"reason":"Unauthorized"});
	}
});

api.post('/eliminarClave', (req,res) => {
    var token = req.body.token;
    var tokenUsuario = req.body.tokenUsuario;
    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([token, tokenUsuario])){
            const Clave = mongoose.model('Clave', databaseConfig.clavesSchema);
            Clave.deleteOne({ 
                token: token,
                tokenUsuario: tokenUsuario
             }, function(err, clave){
                if (clave.deletedCount == 1){
                    res.status(200).json({"result":"OK"});
                } else {
                    res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
                }
             })
             .catch (err => {
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
             });

        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

api.post('/guardarClave', (req,res) => {
    var usuarioToken = req.body.usuarioToken;
    var token = req.body.token;
    var titulo = req.body.titulo;
    var valor = req.body.valor;
    var usuario = req.body.usuario;
    var contrasena = req.body.contrasena;
    var fecha = req.body.fecha;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([usuarioToken, token, titulo, fecha])){
            const Clave = mongoose.model('Clave', databaseConfig.clavesSchema);
            Clave.findOne({
                token: token
            }, function(err, clave){
                if(clave != null){
                    clave.titulo = titulo
                    clave.valor = valor
                    clave.usuario = usuario
                    clave.contrasena = contrasena
                    clave.save().then(clave => {
                        res.status(200).json({clave});
                    })
                    .catch(err => {
                        res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
                    })
                } else {
                    const nuevaClave = new Clave({ 
                        tokenUsuario: usuarioToken,
                        token: token,
                        titulo: titulo,
                        valor: valor,
                        usuario: usuario,
                        contrasena: contrasena,
                        fecha: fecha
                    });
                    nuevaClave.save().then(clave => {
                        res.status(200).json({clave});
                    })
                    .catch(err => {
                        res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
                    });
                }
            })
            .catch(err => {
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
            });
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
    } else {
        res.status(401).json({"reason":"Unauthorized"});
    }
});

module.exports = api;