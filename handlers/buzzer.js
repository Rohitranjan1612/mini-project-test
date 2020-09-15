const Gpio = require('onoff').Gpio;
const logger = require('../log');
let buzzer;

exports.startAlarm = () => {
    buzzer = new Gpio(17, 'out');
    buzzer.write(1, (err) => {
        if (err) {
            logger.error({ err }, 'error in buzzer');
        }
        logger.info('starting alarm');
    });
};

exports.stopAlarm = () => {
    buzzer.unexport();
};

process.on('SIGINT', () => {
    buzzer.unexport();
});
