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
                nuevoGrupo.miembros.push(usuarioToken);
                const grupoCreado = await nuevoGrupo.save();
                usuarioCreador.grupo = grupoToken;
                const usuarioEditado = await usuarioCreador.save();
                const miembros = await Usuario.find({grupo: grupoToken});
                const categorias = await Categoria.find({grupo: grupoToken});

                var grupo = {
                    "token": grupoCreado.token,
                    "nombre": grupoCreado.nombre,
                    "ahorro": grupoCreado.ahorro,
                    "miembros": miembros,
                    "categorias": categorias
                }

                res.status(200).json({grupo});
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

api.post('/getGrupo', async(req,res) => {
    var usuarioToken = req.body.usuarioToken;

    if(proxy.isUserAuthenticated(req.headers['authtoken'])){
        if (proxy.allValuesNeeded([usuarioToken])){
            try{
                const Grupo = mongoose.model('Grupo', databaseConfig.grupoSchema);
                const Usuario = mongoose.model('Usuario', databaseConfig.usuarioSchema);
                const Categoria = mongoose.model('Categoria', databaseConfig.categoriaSchema);
                
                const usuario = await Usuario.findOne({token: usuarioToken});
                const grupoUsuario = await Grupo.findOne({token: usuario.grupo});
                const miembros = await Usuario.find({grupo: grupoUsuario.token});
                const categorias = await Categoria.find({grupo: grupoUsuario.token});

                var grupo = {
                    "token": grupoUsuario.token,
                    "nombre": grupoUsuario.nombre,
                    "ahorro": grupoUsuario.ahorro,
                    "miembros": miembros,
                    "categorias": categorias
                }

                res.status(200).json({grupo});

                
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
                const nuevaCategoria = new Grupo({
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