import { forwardRef, Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { HostelModule } from 'src/hostel/hostel.module';
import { NotificationConfig } from './notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationConfig]),
    FirebaseModule,
    HostelModule,
    forwardRef(() => UserModule),
  ],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
