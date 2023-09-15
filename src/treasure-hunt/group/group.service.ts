import { Injectable } from '@nestjs/common';
import { Group } from './group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '../config/config.service';
import { Question } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';
import { shuffle } from 'src/utils/treasureHuntFunctions';
import { autoGenPass } from 'src/utils';
// import { shuffle } from 'old-code/src/utils';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    private readonly userServive: UserService,
    private readonly configService: ConfigService,
    private readonly questionSerice: QuestionsService,
  ) {}
  async createGroup() {
    let newGroup = new Group();

    const questions = await this.questionSerice.findAllQuestion();
    let questionIds: string[] = [];
    questions.map((question) => questionIds.push(question.id));
    questionIds = shuffle(questionIds);

    newGroup.order = questionIds;
    newGroup.code = autoGenPass(8);
    return await this.groupRepository.save(newGroup);
  }

  async nameGroup(name: string, user: User) {
    let data = await this.getGroups(user);
    let group = data.group;

    // let group = await this.findGroup(groupId);
    group.name = name;
    return await this.groupRepository.save(group);
  }

  async findGroup(groupId: string) {
    return await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });
  }

  async FindAllGroup() {
    return await this.groupRepository.find({ relations: ['users'] });
  }
  async findGroups(maxMembers: number) {
    let group = await this.FindAllGroup();
    let finalGroup = group.filter((g) => g.users?.length < maxMembers);
    return finalGroup;
  }

  async getGroups(user: User) {
    try {
      const newUser = await this.userServive.getOneById(user.id, [
        'group',
        'group.users',
      ]);
      //constrints
      const startTime = await this.configService.findItemBYKey('startTime');
      const endTime = await this.configService.findItemBYKey('endTime');
      const maxMembers = await this.configService.findItemBYKey('maxMembers');
      const minMembers = await this.configService.findItemBYKey('minMembers');

      const group = newUser.group;

      if (!group) return null;

      let questions: Question[] | null = [];
      const d = new Date();
      if (
        d.getTime() >= new Date(startTime!.value).getTime() &&
        d.getTime() <= new Date(endTime!.value).getTime() &&
        group.users.length >= parseInt(minMembers!.value)
      ) {
        let questionIds = group.order;
        const questionsN = await this.questionSerice.findAllQuestion();
        questions = [];
        for (let i in questionIds) {
          questions.push(questionsN.filter((q) => q.id === questionIds[i])[0]);
        }
      }

      if (group.name == null) group.name = 'Group Name';
      // console.log({
      //   group: group,
      //   questions: questions,
      //   startTime: startTime!.value,
      //   endTime: endTime!.value,
      //   minMembers: parseInt(minMembers!.value),
      //   maxMembers: parseInt(maxMembers!.value),
      // });
      return {
        group: group,
        questions: questions,
        startTime: startTime!.value,
        endTime: endTime!.value,
        minMembers: parseInt(minMembers!.value),
        maxMembers: parseInt(maxMembers!.value),
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async leaveGroup(user: User) {
    try {
      // find user to access group
      const userN = await this.userServive.getOneById(user.id, [
        'group',
        'group.users',
      ]);

      // leaving group
      var group = userN!.group;

      group.users = group.users.filter((u) => u.id !== user.id);

      let groupEdited = await this.groupRepository.save(group!);
      console.log('here');
      return !!groupEdited;
    } catch (e) {
      throw new Error(e);
    }
  }
}
