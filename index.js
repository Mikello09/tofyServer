const server = require('./Helper/server');
const PORT = process.env.PORT || 5000


server.listen(PORT, '0.0.0.0', () => {
    console.log('listening to server');
});