const FCM = require("fcm-node");
const serverKey =
  "AAAAy4xqH0o:APA91bE8erYvlvDquQ-UaBkY0gCVpxxX2Z9gsYQkJLTpMe2wc2bx-LQohu2PYGRxiMkjHNzTC7cr9hEB8_e-aWYllFhwnT6vjCR7D-zNFXuOAC0yfFFB8t9HuYxFOiEGfGIzS0HTiLzK";
var fcm = new FCM(serverKey);

export default fcm;
