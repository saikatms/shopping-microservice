const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { APP_SECRET,
  EXCHANGE_NAME,
  SHOPPING_SERVICE,
  CUSTOMER_SERVICE,
  QUEUE_NAME,
  MSG_QUEUE_URL,
 } = require("../config");
const amqplib = require("amqplib");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};


//message broker 
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(EXCHANGE_NAME, "direct", { autoDelete: false, durable: true, exclusive: false});
    return channel;
  } catch (err) {
    throw err;
  }
};

module.exports.SubscribeMessage = async (channel, service) => {
  await channel.assertExchange(EXCHANGE_NAME, "direct", { autoDelete: false, durable: true, exclusive: false });
  const q = await channel.assertQueue(QUEUE_NAME, { autoDelete: false, durable: true, exclusive: false});
  console.log(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, CUSTOMER_SERVICE);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg.content) {
        console.log("the message is:", msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      console.log("[X] received");
    },
    {
      noAck: true,
    }
  );
};