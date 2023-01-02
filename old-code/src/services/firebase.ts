import * as firebaseAdmin from "firebase-admin";
import * as serviceAccount from "./serviceAccountKey.json";

class FirebaseClient {
  private admin: firebaseAdmin.app.App | null;

  constructor() {
    this.admin = null;
    if (this.admin === null) {
      this.admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          serviceAccount as firebaseAdmin.ServiceAccount
        ),
      });
    }
  }

  sendMessage(
    registrationTokenOrTokens: string | string[],
    payload: firebaseAdmin.messaging.MessagingPayload
  ) {
    const limit = 999;
    for (
      let index = 0;
      index < registrationTokenOrTokens.length;
      index += limit
    ) {
      const tokens = registrationTokenOrTokens.slice(index, index + limit);

      this.admin
        ?.messaging()
        .sendToDevice(tokens, payload, {
          contentAvailable: true,
          priority: "high",
          timeToLive: 60 * 60 * 24,
        })
        .then((a) => console.log(a))
        .catch((e) => console.log(e));
    }
  }
}

export default new FirebaseClient();
