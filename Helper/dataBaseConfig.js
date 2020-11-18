'use strict';

const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const { MongoNetworkError, Int32 } = require('mongodb');

const uri = 'mongodb+srv://admin:admin@tofy.kggvq.mongodb.net/Tofy?retryWrites=true&w=majority';

const usuarioSchema = new mongoose.Schema({
    email: String,
    pass: String,
    token: String
}); 

const clavesSchema = new mongoose.Schema({
    tokenUsuario: String,
    titulo: String,
    usuario: String,
    contrasena: String,
    valor: String
});


module.exports = {usuarioSchema, uri}