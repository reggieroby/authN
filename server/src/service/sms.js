
import { SNSClient, AddPermissionCommand } from '@aws-sdk/client-sns'
import applicationConfig from '../config'

export async function sendSMS(cell, message) {
  const client = new SNSClient({
    credentials: applicationConfig.get().awsCredentialsPath
  });

  // var params1 = {
  //   attributes: {
  //     /* required */ DefaultSMSType: "Promotional",
  //   },
  // };

  // await sns("setSMSAttributes", params1);

  const params = {
    Message: message,
    PhoneNumber: cell,
    Subject: "OTP",
  };
  const command = new AddPermissionCommand(params);
  return client.send(command);


};