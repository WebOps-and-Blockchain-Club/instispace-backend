import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { typeOrmModuleOptions } from './data-source';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PostParentModule } from './post/postParent.module';
import { HostelModule } from './hostel/hostel.module';
import { AmenityModule } from './amenity/amenity.module';
import { HostelContactModule } from './hostelContact/hostelContact.module';
import { HostelAnnouncementModule } from './hostelAnnouncement/hostelAnnouncement.module';
import { NotificationModule } from './notification/notification.module';
import { LdapModule } from './ldap/ldap.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    CourseModule,
    TagModule,
    PostParentModule,
    HostelModule,
    AmenityModule,
    HostelContactModule,
    HostelAnnouncementModule,
    NotificationModule,
    LdapModule,
    FirebaseModule,
  ],
})
export class AppModule {}
