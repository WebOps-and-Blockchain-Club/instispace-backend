import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { CommonModule } from './common/common.module';
import { PostParentModule } from './post/postParent.module';
import { HostelModule } from './hostel/hostel.module';
import { AmenityModule } from './amenity/amenity.module';
import { HostelContactModule } from './hostelContact/hostelContact.module';
import { HostelAnnouncementModule } from './hostelAnnouncement/hostelAnnouncement.module';
import { NotificationModule } from './notification/notification.module';
import { LdapModule } from './ldap/ldap.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { CourseModule } from './course/course.module';
import { CalendarModule } from './calendar/calendar.module';
import { LdapListModule } from './ldapList/ldapList.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    NotificationModule,
    CalendarModule,
    CourseModule,
    TagModule,
    PostParentModule,
    HostelModule,
    AmenityModule,
    HostelContactModule,
    HostelAnnouncementModule,
    LdapModule,
    FirebaseModule,
    LdapListModule,
  ],
})
export class AppModule {}
