'use strict';

const express = require('express');
const app = express();
const routerUsuario = require('../Usuario/usuarioRouter');
const routerClave = require('../Claves/clavesRouter');

app
.use('/usuario/',routerUsuario)
.use('/clave/',routerClave)

module.exports = app;