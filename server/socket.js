let io

module.exports = {
    init: (server) => {
        io = require('socket.io')(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                // allowedHeaders: ["my-custom-header"],
                // credentials: true
            }
        })
        return io
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket not initialized')
        }

        return io
    }
}