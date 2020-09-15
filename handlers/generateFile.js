const fs = require('fs');
const Promise = require('bluebird');
const logger = require('../log');


exports.generate = (result, filePath) => {
    const resultFile = fs.createWriteStream(filePath);

    resultFile.on('error', (err) => {
      logger.error('Error writing to result file', err);
      process.exit(1);
    });

    resultFile.on('finish', () => {
      logger.info('Done writing results');
    });

    return new Promise((resolve, reject) => {
        let resultLine = result;
        resulltLine = resultLine.replace(/,\s*$/, "") + "\r\n"
        resultFile.write(resulltLine, () => {
            resultFile.emit('finish');
            resolve();
        })
    })
};
