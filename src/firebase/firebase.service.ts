import { Injectable, Scope } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json';

//scope: Request scope creates an instance when injected and deletes it when the request is done
@Injectable()
export class FirebaseService {
  private admin: firebaseAdmin.app.App | null;
  constructor() {
    this.admin = null;
    if (this.admin === null && !firebaseAdmin.apps.length) {
      this.admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          serviceAccount as firebaseAdmin.ServiceAccount,
        ),
      });
    } else {
      firebaseAdmin.app();
    }
  }

  sendMessage(
    registrationTokenOrTokens: string | string[],
    payload: firebaseAdmin.messaging.MessagingPayload,
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
          priority: 'high',
          timeToLive: 60 * 60 * 24,
        })
        .then((a) => console.log(a))
        .catch((e) => console.log(e));
    }
  }
}
