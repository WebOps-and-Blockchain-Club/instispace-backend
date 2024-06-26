import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UserModule } from 'src/user/user.module';
import { HostelModule } from 'src/hostel/hostel.module';
import { NotifConfigModule } from 'src/notif-config/notif-config.module';

@Module({
  imports: [FirebaseModule, UserModule, HostelModule, NotifConfigModule],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
