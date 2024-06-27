const AWS = require("aws-sdk");
const axios = require("axios");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { email, subject, text } = body;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      id: new Date().getTime().toString(),
      email,
      subject,
      text,
      timestamp: new Date().toISOString(),
      type: "email",
    },
  };

  try {
    // Insert the email into DynamoDB
    await dynamoDb.put(params).promise();

    // Send the email using Mailjet API
    const mailjetResponse = await axios.post(
      "https://api.mailjet.com/v3.1/send",
      {
        Messages: [
          {
            From: {
              Email: "admin@verdantvisionslandscapingadmin.com",
              Name: "Verdant Visions Admin",
            },
            To: [
              {
                Email: email,
                Name: "Recipient Name",
              },
            ],
            Subject: subject,
            TextPart: text,
          },
        ],
      },
      {
        auth: {
          username: process.env.MAILJET_API_KEY,
          password: process.env.MAILJET_SECRET_KEY,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email processed and sent successfully",
        mailjetResponse: mailjetResponse.data,
      }),
    };
  } catch (error) {
    console.error("Error processing email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
