const url = require('url');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const config = require('./configs/main');
const errors = require('./configs/errors');
const errorsFactory = require('./utils/error-factory');

let wss;
const clients = { };

module.exports = {
    init(server) {
        wss = new WebSocket.Server({ server });
        onInit(wss);
        return wss;
    },
    getSocket() {
        if (wss) {
            return wss;
        } else {
            throw new Error('WSS not initialized');
        }
    },
    sendMessage(clientId, payload) {
        const client = clients[clientId];
        if (client) {
            client.send(JSON.stringify(payload));
        }
    }
}

function onInit(socket) {
    socket.on('connection', (ws, request) => {
        try {
            const parsed = url.parse(request.url, true);
            const token = parsed.query.token;
    
            if (!token) {
                throw errorsFactory(401, errors.INVALID_TOKEN);
            }
    
            let decodedToken;
    
            try {
                decodedToken = jwt.verify(token, config.jwtKey);
            } catch (err) {
                throw errorsFactory(401, errors.INVALID_TOKEN);
            };
        
            if (!decodedToken) {
                errorsFactory(401, errors.INVALID_TOKEN);
            }
    
            clients[decodedToken.userId] = ws;
        } catch (err) {
            let payload;
    
            if (err.statusCode && err.message) {
                payload = {
                    status: err.statusCode,
                    message: err.message
                };
            } else {
                payload = {
                    status: 500,
                    message: errors.SERVER_ERROR
                };
            }
        
            if (err.data) {
                payload.data = data;
            }
        
            ws.send(JSON.stringify(payload));
            ws.close();
        }
    })
}
