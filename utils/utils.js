const fs = require('fs');


exports.deleteFileFromServer = filePath => (
    fs.unlink(filePath)
);