const http = require('http');
const app = require('./app');
require('dotenv').config();
const socketio = require('./socket');

const port = process.env.PORT || 3000;

app.set('port', port);

const server = http.createServer(app);

const io = socketio.init(server);

io.on('connection', (socket) => {
    console.log('io Connected');
});

server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});