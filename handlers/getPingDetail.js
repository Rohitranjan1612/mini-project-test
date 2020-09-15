const fs = require("fs");
const logger = require("../log");

exports.getPingDetail = () => {
  const filePath = __dirname + "/pingDetail.txt";
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) logger.error({ err }, "error while opening file");
    const pingDetail = data;
    logger.info(pingDetail, "pingDetail in fs.getPingDetail");
    exports.pingDetail = pingDetail;
  });
};
