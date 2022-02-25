const FCM = require("fcm-node");
const serverKey =
  "AAAAy4xqH0o:APA91bHBv0gMwFxMlzkrfO7tiP134mO4PqfxbordRfNIbs8A2W2zmkm0BNU95bqcpYLJjtQNJ7d-_kQ1WI6gzevlM8GVLxHLpKsOZDvH_xFW_IozQE93f3bGWQ35QYDghi9vH8pOPLdy";
var fcm = new FCM(serverKey);

export default fcm;
