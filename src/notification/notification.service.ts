import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/firebase.service';
import Hostel from 'src/hostel/hostel.entity';
import HostelService from 'src/hostel/hostel.service';
import Tag from 'src/tag/tag.entity';
import { UserService } from 'src/user/user.service';
import { Notification } from 'src/utils';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly userServce: UserService,
    private hostelRepository: HostelService,
  ) { }

  //TODO: change the type to Post
  async notifyPost(post: any) {
    let users = await this.userServce.usersForNotif();

    if (post.tags) {
    }
    users = users.filter(
      (user) =>
        user.notifyPost === Notification.FORALL ||
        (user.notifyPost === Notification.FOLLOWED_TAGS &&
          user.interests?.filter(
            (tag) =>
              post.tags.filter((_tag: Tag) => _tag.id === tag.id).length !== 0,
          ).length !== 0),
    );
    let tokens: string[] = [];
    users.map((user) => (tokens = tokens.concat(user.fcmToken.split(' AND '))));

    tokens = tokens.filter((t) => t !== '' && t != null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        id: `${Math.floor(Math.random() * 100)}`,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        title: post.title,
        body: post.content,
        image: post.photo?.split(' AND ')[0] ?? '',
        route: `post/${post.id}`,
      },
    });
  }
  //TODO: change the type to Post
  async notifyComment(post: any, description: string) {
    let tokens = post.createdBy.fcmToken.split(' AND ');
    tokens = tokens.filter((_t: string) => _t !== '' && _t !== null);

    if (post.createdBy.notifyNetopComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          id: `${Math.floor(Math.random() * 100)}`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: `${post.title} got commented`,
          body: description,
          route: `post/${post.id}`,
        },
      });
    }
  }
  //TODO: change the type to Post
  async notifyReportedPost(post: any, report: string) {
    let tokens = post.createdBy.fcmToken.split(' AND ');
    tokens = tokens.filter((_t) => _t !== '' && _t !== null);

    if (post.createdBy.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          id: `${Math.floor(Math.random() * 100)}`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: `${post.title} got reported`,
          body: report,
          route: `post/${post.id}`,
        },
      });
    }
  }

  async notifyAmenity(amenity: any) {
    const hostel = await this.hostelRepository.getOne(amenity.hostel.id);

    let tokens: string[] = [];
    hostel?.users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(' AND '))),
    );

    tokens = tokens.filter((t) => t !== '' && t != null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        id: `${Math.floor(Math.random() * 100)}`,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        title: 'Hostel Update!',
        body: `New amenity: ${amenity.title}`,
        route: 'hostel',
      },
    });
  }

  //TODO: logic for notify all in other post types
}
