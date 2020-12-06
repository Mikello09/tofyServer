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


api.post('/doLogin', (req,res) => {
	var email = req.body.email;
	var pass = req.body.contrasena;
	if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([email, pass])){
            const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
            Usuario.findOne({
                email: email,
                pass: pass
            }, function(err, usuario){  
                if(usuario != null){
                    res.status(200).json({usuario});
                } else {
                    res.status(400).json({"reason":"Email/contraseña incorrectos"});
                }
            })
            .catch(err => {
                res.status(500).json({"reason":"Error interno, vuelva a intentarlo"});
            });
        } else {
            res.status(400).json({"reason":"Faltan valores en la llamada"});
        }
			
	}else {
		res.status(401).json({"reason":"Unauthorized"});
	}
});

api.post('/registro', (req,res) => {
    var email = req.body.email;
    var pass = req.body.pass;
    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([email,pass])){
            const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
            const nuevoUsuario = new Usuario({ 
                email: email,
                pass: pass,
                token: randomToken(16)
            });
            nuevoUsuario.save().then(usuario => {
                res.status(200).json({usuario});
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