const fs = require("fs");
const logger = require("./log");
const { expireWebMembership } = require("./services/api/crt-server");
// db creds
exports.host = "localhost";
exports.mysql_user = "crt";
exports.mysql_password = "password";
exports.mysql_db = "crtapp";

// login table
exports.login_table = "user";
exports.params_table = "params";
exports.crtapp_table = "crtapp";

// CRT Web
// Backup Limit Time for data
exports.backup_limt_time = 7; // time unit is day
// Expire Web Membership
const crt_params_web_flag = 0;
exports.crt_params_web_flag = crt_params_web_flag;
exports.expireWebMembership = () => {
  setInterval(() => {  
    if (crt_params_web_flag) {
      const filePath = __dirname + "/handlers/crtId.txt";
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) logger.error({ err }, "error while opening file");
        const crtId = data;
        //   logger.info(crtId, "crtId in fs.freadFile");
        const params = {
          crtId: crtId,
        };
        return expireWebMembership(params)
          .then((resp) => {
            // logger.info(
            //   { resp: resp.data.expireWebMembership },
            //   "successfull get expire Web Membership."
            // );
            exports.crt_web_flag = resp.data.expireWebMembership;
          })
          .catch((err) => {
            logger.error({ err }, "error while calling api");
          });
      });
    }
  }, 30000);
};

// Time Interval for sending data
// time unit is min
// exports.time_interval = 15;

// pen drive location
exports.destDir = "/media/pi/";

// master password
exports.master_password = "crtapp";

// --arch=armv7a for linux systems
