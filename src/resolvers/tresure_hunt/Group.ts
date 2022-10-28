import { CreateGroupInput } from "../../types/inputs/treasure_hunt/group";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { autoGenPass, shuffle } from "../../utils";
import MyContext from "../../utils/context";
import Group from "../../entities/tresure_hunt/Group";
import Question from "../../entities/tresure_hunt/Question";
import GetGroupOutput from "../../types/objects/treasure_hunt/group";
import User from "../../entities/User";
import Config from "../../entities/tresure_hunt/Config";

@Resolver(() => Group)
class GroupResolver {
  @Mutation(() => Group)
  @Authorized()
  async createGroup(
    @Ctx() { user }: MyContext,
    @Arg("GroupData") { name }: CreateGroupInput
  ) {
    try {
      // shuffling questions for each group
      const questions = await Question.find();
      let questionIds: string[] = [];
      questions.map((question) => questionIds.push(question.id));
      questionIds = shuffle(questionIds);

      // creating new group
      const group = new Group();
      group.code = autoGenPass(8);
      group.name = name;
      group.users = [user];
      group.order = questionIds;
      group.createdBy = user;

      // saving and returning
      const groupCreated = await group.save();
      return groupCreated;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async leaveGroup(@Ctx() { user }: MyContext) {
    try {
      // find user to access group
      const userN = await User.findOne({
        where: { id: user.id },
        relations: ["group", "group.users"],
      });

      // leaving group
      const group = userN!.group;
      group.users = group.users.filter((u) => u.id !== user.id);

      const groupEdited = await group!.save();
      return !!groupEdited;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async joinGroup(@Ctx() { user }: MyContext, @Arg("GroupCode") code: string) {
    try {
      // contraints
      const maxMembers = await Config.findOne({ where: { key: "maxMembers" } });

      // joining group
      const group = await Group.findOne({
        where: { code: code },
        relations: ["users"],
      });
      if (!group) throw new Error("Invalid Group Code");

      if (group.users.length > parseInt(maxMembers!.value))
        throw new Error("Memeber Limit Exceeded");
      if (group.users.filter((u) => u.id === user.id).length)
        throw new Error("Already a Member");
      group.users = group!.users.concat(user);

      const groupEdited = await group!.save();
      return !!groupEdited;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => GetGroupOutput, { nullable: true })
  @Authorized()
  async getGroup(@Ctx() { user }: MyContext) {
    try {
      const userN = await User.findOne({
        where: { id: user.id },
        relations: ["group", "group.users"],
      });

      //constraints
      const startTime = await Config.findOne({ where: { key: "startTime" } });
      const endTime = await Config.findOne({ where: { key: "endTime" } });
      const minMembers = await Config.findOne({ where: { key: "minMembers" } });
      const maxMembers = await Config.findOne({ where: { key: "maxMembers" } });

      const group = userN!.group;
      if (!group) return null;

      let questions: Question[] | null = null;
      const d = new Date();
      if (
        d.getTime() >= new Date(startTime!.value).getTime() &&
        d.getTime() <= new Date(endTime!.value).getTime() &&
        group.users.length >= parseInt(minMembers!.value)
      ) {
        let questionIds = group.order;
        const questionsN = await Question.find();
        questions = [];
        for (let i in questionIds) {
          questions.push(questionsN.filter((q) => q.id === questionIds[i])[0]);
        }
      }

      return {
        group: group,
        questions: questions,
        startTime: startTime!.value,
        endTime: endTime!.value,
        minMembers: parseInt(minMembers!.value),
        maxMembers: parseInt(maxMembers!.value),
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => [User])
  async users(@Root() { id, users }: Group) {
    try {
      if (users) return users;
      const group = await Group.findOne({
        where: { id },
        relations: ["users"],
      });
      return group!.users;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Group) {
    try {
      if (createdBy) return createdBy;
      const group = await Group.findOne({
        where: { id: id },
        relations: ["createdBy"],
      });
      return group!.createdBy;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default GroupResolver;
