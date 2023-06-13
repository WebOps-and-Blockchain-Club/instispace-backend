import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotifConfigModule } from 'src/notif-config/notif-config.module';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
  imports: [NotifConfigModule],
})
export class FirebaseModule {}
