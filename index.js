const server = require('./Helper/server');
const mongoose = require('mongoose');
const databaseConfig = require('./Helper/dataBaseConfig');
const PORT = process.env.PORT || 3000

mongoose.connect(databaseConfig.uri, {useNewUrlParser: true, useUnifiedTopology: true})

server.listen(PORT, '0.0.0.0', () => {
    console.log('listening to server');
});