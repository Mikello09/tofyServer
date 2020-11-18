'use strict';

const express = require('express');
const app = express();
const routerUsuario = require('../Usuario/usuarioRouter');

app
.use('/usuario/',routerUsuario)

module.exports = app;