import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
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
import { NotifConfigModule } from './notif-config/notif-config.module';
import { LdapListModule } from './ldapList/ldapList.module';
import { CourseModule } from './course/course.module';
import { CalendarModule } from './calendar/calendar.module';
import { ClubModule } from './club/club.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    TagModule,
    PostParentModule,
    HostelModule,
    AmenityModule,
    HostelContactModule,
    HostelAnnouncementModule,
    NotificationModule,
    LdapModule,
    FirebaseModule,
    NotifConfigModule,
    LdapListModule,
    CourseModule,
    CalendarModule,
    ClubModule,
    BadgesModule,
  ],
})
export class AppModule {}
