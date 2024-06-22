const AWS = require("aws-sdk");
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
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email processed successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
