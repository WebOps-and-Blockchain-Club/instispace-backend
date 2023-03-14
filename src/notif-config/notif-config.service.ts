import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
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
    let newUser = await this.userService.getOneById(user.id, ['notifConfig']);
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

  update(id: number, updateNotifConfigInput: UpdateNotifConfigInput) {
    return `This action updates a #${id} notifConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} notifConfig`;
  }
}
