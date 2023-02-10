import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [NotificationService, NotificationResolver],
  imports: [FirebaseModule, UserModule],
  exports: [NotificationService],
})
export class NotificationModule {}
