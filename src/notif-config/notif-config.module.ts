import { forwardRef, Module } from '@nestjs/common';
import { NotifConfigService } from './notif-config.service';
import { NotifConfigResolver } from './notif-config.resolver';
import { NotifConfig } from './notif-config.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotifConfig]),
    forwardRef(() => UserModule),
  ],
  providers: [NotifConfigResolver, NotifConfigService],
  exports: [NotifConfigService],
})
export class NotifConfigModule {}
