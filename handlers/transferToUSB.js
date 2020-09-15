// requires
const logger = require("../log");
const Promise = require("bluebird");
const utils = require("../utils/utils");
const generateFile = require("./generateFile");
const config = require("../config");
const fs = require("fs");
const path = require("path");
// const usb = require('../connections/usb');

const filesDir = __dirname + "/files";

exports.generate = (result, nameOfFile) => {
  //File file name here
  const fileName = nameOfFile;
  const filePath = filesDir + "/" + fileName;

  logger.warn(filePath);

  generateFile
    .generate(result, filePath)
    // .then(() => {
    //     // transfer to usb now.

    // })
    // .then(() => {
    //     utils.deleteFileFromServer(filePath);
    // })
    .catch((error) => {
      logger.error("Error in transfering file", { error });
    });
};

exports.generatecrtId = (result) => {
  //File file name here
  const filePath = __dirname + "/crtId.txt";

  logger.info(filePath);

  return generateFile.generate(result, filePath).catch((error) => {
    logger.error("Error in saving CrtId in file", { error });
  });
};

exports.generatePingDetail = (result) => {
  //File file name here
  const filePath = __dirname + "/pingDetail.txt";

  logger.info(filePath);

  return generateFile.generate(result, filePath).catch((error) => {
    logger.error("Error in saving ping detail in file", { error });
  });
};

exports.transfer = (pd, cb) => {
  fs.readdir(filesDir, function (err, files) {
    let destDir = config.destDir + pd;
    logger.info(filesDir, destDir, "directory");
    if (err) {
      logger.error(err, "error reading files from filesDir[transferToUsb]");
      cb(err);
    } else {
      files.forEach(function (file) {
        if (
          file.split(/[.]+/).pop() === "txt" ||
          file.split(/[.]+/).pop() === "csv"
        ) {
          logger.warn(file, "transferring this file");
          var read = fs.createReadStream(path.join(filesDir, file));
          var write = fs.createWriteStream(path.join(destDir, file));
          read.pipe(write);

          write.on("error", () => {
            logger.error(
              err,
              "error transfering files to destDir[transferToUsb]"
            );
            cb("error transfering files to destDir[transferToUsb]");
          });

          write.on("finish", () => {
            logger.info("All deeds done!!");
            cb(null, "Successfully transfered");
          });
        } else {
          logger.warn(file, "file not transferring");
        }
      });
    }
  });
};

exports.deleteDirectory = () => {
  fs.readdir(filesDir, function (err, files) {
    logger.info(filesDir, "directory");
    if (err) {
      logger.error(
        err,
        "error reading files from filesDir for deletingfiles[transferToUsb, deleteDirectory]"
      );
    } else {
      files.forEach(function (file) {
        if (
          file.split(/[.]+/).pop() === "txt" ||
          file.split(/[.]+/).pop() === "csv"
        ) {
          logger.warn(file, "file in filesdir going to be deleted");
          let filePath = filesDir + "/" + file;
          utils.deleteFileFromServer(filePath);
          logger.warn(filePath, "deleted");
        } else {
          logger.warn(file, "file not deleting");
        }
      });
    }
  });
};
