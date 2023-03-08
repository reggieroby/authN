/*
 * Copyright 2013. Amazon Web Services, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var AWS = require("aws-sdk");
export const sendSMS = (credentialsPath) => async (cell, message) => {
  AWS.config.loadFromPath(credentialsPath);

  function servicePromise(service) {
    return async function (fn, param = {}) {
      return new Promise((resolve, reject) => {
        service[fn](param, function (err, data) {
          err ? reject(err, err.stack) : resolve(data);
        });
      });
    };
  }

  var sns = servicePromise(new AWS.SNS());

  var params1 = {
    attributes: {
      /* required */ DefaultSMSType: "Promotional",
    },
  };

  await sns("setSMSAttributes", params1);
  var params = {
    Message: message,
    PhoneNumber: cell,
    Subject: "OTP",
  };
  await sns("publish", params);
};
