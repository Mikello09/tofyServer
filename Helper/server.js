'use strict';

const express = require('express');
const app = express();
const routerUsuario = require('../Usuario/usuarioRouter');
const routerClave = require('../Claves/clavesRouter');
const routerPolicy = require('../Privacy/privacyRouter');

app
.use('/usuario/',routerUsuario)
.use('/clave/',routerClave)
.use('',routerPolicy)

module.exports = app;