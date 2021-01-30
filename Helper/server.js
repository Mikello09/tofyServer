'use strict';

const express = require('express');
const app = express();
const routerUsuario = require('../Usuario/usuarioRouter');
const routerClave = require('../Claves/clavesRouter');
const routerPolicy = require('../Privacy/privacyRouter');
const routerGrupo = require('../Grupo/grupoRouter');
const routerPeriodo = require('../Periodo/periodoRouter');

app
.use('/usuario/',routerUsuario)
.use('/clave/',routerClave)
.use('',routerPolicy)
.use('/grupo/',routerGrupo)
.use('/periodo/',routerPeriodo)

module.exports = app;