import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import Tag from 'src/tag/tag.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Any, FindOptionsWhere, ILike, Like, Raw, Repository } from 'typeorm';
import { NotifConfig } from './notif-config.entity';
import { CreateNotifConfigInput } from './type/create-notif-config.input';
import { UpdateNotifConfigInput } from './type/update-notif-config.input';

@Injectable()
export class NotifConfigService {
  constructor(
    @InjectRepository(NotifConfig)
    private notifRepository: Repository<NotifConfig>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create(createNotifConfigInput: CreateNotifConfigInput, user: User) {
    let newConfig = new NotifConfig();
    newConfig.fcmToken = createNotifConfigInput.fcmToken;
    let newUser = await this.userService.getOneById(user.id, [
      'notifConfig',
      'interests',
    ]);
    if (
      newUser.notifConfig.filter(
        (c) => c.fcmToken === createNotifConfigInput.fcmToken,
      ).length === 0
    ) {
      newConfig.createdBy = newUser;
      return await this.notifRepository.save(newConfig);
    }
  }

  findAll() {
    return `This action returns all notifConfig`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notifConfig`;
  }

  async update(
    fcmToken: string,
    updateNotifConfigInput: UpdateNotifConfigInput,
  ) {
    let notif = await this.notifRepository.findOne({
      where: { fcmToken: fcmToken },
    });

    if (updateNotifConfigInput.followedTagsPost)
      notif.followedTagsPost = updateNotifConfigInput.followedTagsPost;

    if (updateNotifConfigInput.forAllPost)
      notif.forAllPost = updateNotifConfigInput.forAllPost;

    if (updateNotifConfigInput.nonePost)
      notif.nonePost = updateNotifConfigInput.nonePost;
  }

  async forAllNotifInputs(post: Post) {
    let notifList = await this.notifRepository.find({
      where: {
        forAllPost: Raw((alias) => `'${post.category}' = ANY (${alias})`),
      },
    });
    let tokens: string[] = [];
    notifList.map((e) => tokens.push(e.fcmToken));
    return tokens;
  }

  async followedTagsNotifInput(post: Post) {
    let notifList = await this.notifRepository.find({
      where: {
        followedTagsPost: Raw((alias) => `'${post.category}' = ANY (${alias})`),
      },
      relations: ['createdBy', 'createdBy.interests'],
    });
    let tokens: string[] = [];
    notifList.map((n) => {
      if (
        n.createdBy.interests?.filter(
          (tag) => post.tags.filter((_tag) => _tag.id === tag.id).length !== 0,
        ).length !== 0
      )
        tokens.push(n.fcmToken);
    });

    return tokens;
  }

  async notifComment(post: Post) {
    let newUser = await this.userService.getOneById(post.createdBy.id, [
      'notifConfig',
    ]);
    let notifList = newUser.notifConfig;
    let tokens: string[] = [];
    notifList.map((e) => tokens.push(e.fcmToken));
    return tokens;
  }

  remove(id: number) {}
}
