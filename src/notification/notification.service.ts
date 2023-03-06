import { forwardRef, Global, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirebaseService } from 'src/firebase/firebase.service';
import HostelService from 'src/hostel/hostel.service';
import Tag from 'src/tag/tag.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Notification } from 'src/utils';
import { Repository } from 'typeorm';
import { NotificationConfig } from './notification.entity';
import { UpdateNotificationConfigInput } from './type/update-notification-config';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationConfig)
    private notificationRepository: Repository<NotificationConfig>,
    private readonly firebase: FirebaseService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private hostelRepository: HostelService,
  ) {}

  //TODO: change the type to Post
  async notifyPost(post: any) {
    let users = await this.userService.usersForNotif();
    // console.log(users);
    let tokens: string[] = [];
    //populating tokenDemo based on updated structure
    await Promise.all(
      users?.map(async (user) => {
        user.notificationConfig?.map((c) => {
          if (
            c.configForPost === Notification.FORALL ||
            (c.configForPost === Notification.FOLLOWED_TAGS &&
              user.interests?.filter(
                (tag) =>
                  post.tags.filter((_tag: Tag) => _tag.id === tag.id).length !==
                  0,
              ).length !== 0)
          )
            tokens.push(c.fcmToken);
        });
      }),
    );

    // users = users.filter(
    //   (user) =>
    //     user.notifyPost === Notification.FORALL ||
    //     (user.notifyPost === Notification.FOLLOWED_TAGS &&
    //       user.interests?.filter(
    //         (tag) =>
    //           post.tags.filter((_tag: Tag) => _tag.id === tag.id).length !== 0,
    //       ).length !== 0),
    // );
    // let tokens: string[] = [];
    // users.map((user) => (tokens = tokens.concat(user.fcmToken.split(' AND '))));

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

  async createNotificationConfig(
    user: User,
    fcmToken: string,
  ): Promise<NotificationConfig> {
    let newNotify = new NotificationConfig();
    newNotify.createdBy = user;
    newNotify.fcmToken = fcmToken;
    console.log(newNotify);
    const notif = await this.notificationRepository.save(newNotify);
    console.log(notif);
    return notif;
  }

  async updateNotificationConfig(
    notificationConfigInput: UpdateNotificationConfigInput,
    fcmToken: string,
  ) {
    let notifToUpdate = new NotificationConfig();
    notifToUpdate = await this.notificationRepository.findOne({
      where: { fcmToken: fcmToken },
    });
    console.log(notifToUpdate);
    if (notificationConfigInput.configForPost)
      notifToUpdate.configForPost = notificationConfigInput.configForPost;

    if (notificationConfigInput.configForLikeReply)
      notifToUpdate.configForLikeReply =
        notificationConfigInput.configForLikeReply;

    if (notificationConfigInput.configForCommentOnQuery)
      notifToUpdate.configForCommentOnQuery =
        notificationConfigInput.configForCommentOnQuery;

    return await this.notificationRepository.save(notifToUpdate);
  }

  async FindNotifByid(id: string) {
    return await this.notificationRepository.findOne({
      where: { id: id },
      relations: ['createdBy'],
    });
  }
}
