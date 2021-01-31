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
    periodoActivo: String
});

const categoriaSchema = new mongoose.Schema({
    token: String,
    grupo: String,
    titulo: String,
    imagen: String,
    tipo: String
});

const periodoSchema = new mongoose.Schema({
    token: String,
    titulo: String,
    ahorroEstimado: String,
    fechaInicio: String,
    fechaFin: String,
    ahorroFinal: String,
    grupo: String
});

const movimientoSchema = new mongoose.Schema({
    token: String,
    descripcion: String,
    valor: String,
    categoria: String,
    fecha: String,
    tipo: String,
    periodo: String,
    grupo: String
});


module.exports = {usuarioSchema,clavesSchema, grupoSchema, categoriaSchema, periodoSchema, movimientoSchema, uri}