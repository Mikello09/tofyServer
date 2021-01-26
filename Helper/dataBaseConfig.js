'use strict';

const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const { MongoNetworkError, Int32 } = require('mongodb');

const uri = 'mongodb+srv://admin:admin@tofy.kggvq.mongodb.net/Tofy?retryWrites=true&w=majority';

const usuarioSchema = new mongoose.Schema({
    email: String,
    pass: String,
    token: String,
    nombre: String,
    grupo: String
}); 

const clavesSchema = new mongoose.Schema({
    tokenUsuario: String,
    token: String,
    titulo: String,
    usuario: String,
    contrasena: String,
    valor: String,
    fecha: String
});

const grupoSchema = new mongoose.Schema({
    token: String,
    nombre: String,
    ahorro: String,
    miembros: [{type:String}],
    categorias: [{type:String}],
    periodos: [{type:String}]
});

const categoriaSchema = new mongoose.Schema({
    token: String,
    grupo: String,
    titulo: String,
    imagen: String,
    tipo: String
});


module.exports = {usuarioSchema,clavesSchema, grupoSchema, categoriaSchema, uri}