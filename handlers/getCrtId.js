const fs = require("fs");
const logger = require("../log");

exports.getCrtId = () => {
  const filePath = __dirname + "/crtId.txt";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) logger.error({ err }, "error while opening file");
    const crtId = data;
    logger.info(crtId, "crtId in fs.getCrtId");
    exports.crtId = crtId;
  });
};
