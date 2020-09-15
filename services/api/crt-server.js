const Axios = require("axios");
const BaseUrl = "http://52.66.13.102:3000";

// Sending device info to server
const getDeviceInfo = (data) => {
  return Axios({
    url: `${BaseUrl}/crtapp/get-device-info`,
    method: "post",
    headers: {
      authorization: "",
    },
    params: null,
    data: data,
  });
};
// Sending records data to server
const getTimeLastConnect = (data) => {
  return Axios({
    url: `${BaseUrl}/crtapp/time-last-connect`,
    method: "post",
    headers: {
      authorization: "",
    },
    params: null,
    data: data,
  });
};

const getTempReading = (data) => {
  return Axios({
    url: `${BaseUrl}/crtapp/get-temp-reading`,
    method: "post",
    headers: {
      authorization: "",
    },
    params: null,
    data: data,
  });
};

const getPingDetails = (data) => {
  return Axios({
    url: `${BaseUrl}/crtapp/get-ping-details`,
    method: "post",
    headers: {
      authorization: "",
    },
    params: null,
    data: data,
  });
};
const expireWebMembership = (data) => {
  return Axios({
    url: `${BaseUrl}/crtapp/expire-web-membership`,
    method: "post",
    headers: {
      authorization: "",
    },
    params: null,
    data: data,
  });
};
module.exports = {
  getDeviceInfo,
  getTempReading,
  getTimeLastConnect,
  getPingDetails,
  expireWebMembership,
};
