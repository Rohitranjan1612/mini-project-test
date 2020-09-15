const sensor = require("ds18b20-raspi");
const pool = require("../connections/db");
// const showError = require("../src/views/scripts/land");

const randomString = (length) => {
    let result = null;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = length; i > 0; i -= 1) {
        if (!result) {
            result = chars[Math.floor(Math.random() * chars.length)];
        } else {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return result;
};

let previousTemp = [];
// main fuction to track
const tracker = () => {
    const currentTemp = sensor.readSimpleC(1);
    const hash = randomString(16);
    console.log({currentTemp, hash}, '****current temperature from w1thermsensor****');
    const id = 1;
    if(currentTemp === null || currentTemp === "85" || currentTemp === "85.0" || currentTemp === "85.00")
    {
        previousTemp.push(currentTemp);
        if (previousTemp.length > 10)
        {
            // showError("error in recording, problem with the sensor");
        }
    }
    else {
        previousTemp = [];
        // insert temp every sec
        // insert in database
        fetchQuery = "SELECT id, current_temp FROM `temperature` WHERE id=1";
        pool.query(fetchQuery)
            .then(([[resp]]) => {
                console.log({resp}, "[fetchQuery] tracker");
                if(Math.abs(resp.current_temp - currentTemp) > 30)
                {
                    // showError("error in recording, problem with the sensor");
                }
                else {
                    if(resp.id){
                        query = 'UPDATE `temperature` SET current_temp=?, hash=? WHERE id=?';
                        pool.query(query, [currentTemp, hash, id])
                            .then(([resp]) => {
                                console.log({resp}, "[update query tracker]");
                            })
                            .catch((error) => {
                                console.error({error}, "[update query tracker]");
                            });
                    }
                    else{
                        query = 'INSERT INTO `temperature` (id, current_temp, hash) VALUES (?,?,?)';
                        pool.query(query, [id, currentTemp, hash])
                            .then(([resp]) => {
                                console.log({resp}, "[update query tracker]");
                            })
                            .catch((error) => {
                                console.error({error}, "[update query tracker]");
                            });
                    }
                }
            })
            .catch((error) => {
                console.error({error}, "[fetchQuery] tracker");
        });
    }
};

exports.startTracker = () => {
    setInterval(tracker, 1000);
};
  
