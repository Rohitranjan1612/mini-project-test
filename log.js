var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'crtapp',
    level: 'error',
    streams: [
        {
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: './log.log'
        }
    ],
});

module.exports = log;
