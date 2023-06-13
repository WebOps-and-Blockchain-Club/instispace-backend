import { Injectable, Scope } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json';
import { NotifConfigService } from 'src/notif-config/notif-config.service';

//scope: Request scope creates an instance when injected and deletes it when the request is done
@Injectable()
export class FirebaseService {
  private admin: firebaseAdmin.app.App | null;

  constructor(private readonly notifService: NotifConfigService) {
    this.admin = null;
    if (this.admin === null) {
      this.admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          serviceAccount as firebaseAdmin.ServiceAccount,
        ),
      });
    }
  }

  async sendMessage(
    registrationTokenOrTokens: string | string[],
    payload: firebaseAdmin.messaging.MessagingPayload,
  ) {
    const limit = 999;
    let arr;
    for (
      let index = 0;
      index < registrationTokenOrTokens.length;
      index += limit
    ) {
      const tokens = registrationTokenOrTokens.slice(index, index + limit);

      await this.admin
        ?.messaging()
        .sendToDevice(tokens, payload, {
          contentAvailable: true,
          priority: 'high',
          timeToLive: 60 * 60 * 24,
        })
        .then((e) => {
          arr = e.results.map((t) => {
            if (t.error) return 0;
            else return 1;
          });
        })
        .catch((e) => console.log(e));

      for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 0) {
          await this.notifService.deleteOneById(tokens[i]);
        }
      }
    }
  }

  checkTokenValidity(token: string) {
    return this.admin.messaging().send({ token: token }, true);
  }
}
