const FCM = require("fcm-node");
import dotenv from "dotenv";
dotenv.config();

const serverKey = process.env.SERVER_KEY!;
var fcm = new FCM(serverKey);

export default fcm;
