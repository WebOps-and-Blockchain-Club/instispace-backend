import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import HostelService from 'src/hostel/hostel.service';
import { NotifConfigService } from 'src/notif-config/notif-config.service';
import { Comments } from 'src/post/comments/comment.entity';
import { CommentsService } from 'src/post/comments/comments.service';
import { Post } from 'src/post/post.entity';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly userServce: UserService,
    private hostelRepository: HostelService,
    private readonly notifService: NotifConfigService,
  ) {}

  //TODO: change the type to Post
  async notifyPost(post: any) {
    let tokensForAll = await this.notifService.forAllNotifInputs(post);
    let tokens = tokensForAll;
    // let tokens = tokensFollowedTags.concat(tokensForAll);
    if (tokens) {
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
  }
  //TODO: change the type to Post
  async notifyComment(post: Post, description: string) {
    // let tokens = post.createdBy.fcmToken.split(' AND ');
    // tokens = tokens.filter((_t: string) => _t !== '' && _t !== null);
    let tokens = await this.notifService.notifComment(post);
    if (tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          id: `${Math.floor(Math.random() * 100)}`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: `${post.title} got commented`,
          body: description,
          route: `post/comment/${post.id}`,
        },
      });
    }
  }
  //TODO: change the type to Post
  async notifyReportedPost(post: Post, report: string) {
    // let tokens = post.createdBy.fcmToken.split(' AND ');
    // tokens = tokens.filter((_t) => _t !== '' && _t !== null);

    let tokens = await this.notifService.reportedPost(post);
    if (tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          id: `${Math.floor(Math.random() * 100)}`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: `${post.title} got reported`,
          body: report,
          route: `post/reported/${post.id}`,
        },
      });
    }
  }
  async notifyReportedComment(comment: Comments, report: string) {
    // let tokens = post.createdBy.fcmToken.split(' AND ');
    // tokens = tokens.filter((_t) => _t !== '' && _t !== null);

    // let tokens = await this.notifService.reportedPost(comment);

    let tokens = await this.notifService.reportedComment(comment);
    if (tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          id: `${Math.floor(Math.random() * 100)}`,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: `${comment.content} got reported`,
          body: report,
          route: `comment/reported/${comment.id}`,
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

  async likedPost(post: Post) {
    let tokens = await this.notifService.likedPost(post);
    this.firebase.sendMessage(tokens, {
      data: {
        id: `${Math.floor(Math.random() * 100)}`,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        title: `${post.title} got liked `,
        body: post.content,
        route: `post/liked/${post.id}`,
      },
    });
  }
  async likedComment(comment: Comments) {
    let tokens = await this.notifService.likedComment(comment);
    this.firebase.sendMessage(tokens, {
      data: {
        id: `${Math.floor(Math.random() * 100)}`,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        title: `${comment.content} got liked `,
        body: '',
        route: `comment/liked/${comment.id}`,
      },
    });
  }

  //TODO: logic for notify all in other post types
}
