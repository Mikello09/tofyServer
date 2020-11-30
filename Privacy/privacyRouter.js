'use strict'

const express = require('express');
const api = express.Router();


api.get('/privacy', (req,res) => {
	res.sendFile(__dirname + '/privacyPolicy.html');
});

module.exports = api;