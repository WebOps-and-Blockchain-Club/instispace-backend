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

      // saving and returning
      const groupCreated = await group.save();
      return groupCreated;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async joinGroup(@Ctx() { user }: MyContext, @Arg("GroupCode") code: string) {
    try {
      // contraints
      const constraints = await Config.find();

      // joining group
      const group = await Group.findOne({
        where: { code: code },
        relations: ["users"],
      });
      if (group!.users.length > constraints[0].maxMembers)
        throw new Error("Memeber Limit Exceeded");
      if (group!.users.filter((u) => u.id === user.id).length)
        throw new Error("Already a Member");
      group!.users = group!.users.concat(user);

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
        relations: ["group"],
      });

      // constraints
      const constraints = await Config.find();

      const group = userN!.group;
      if (!group) return null;

      let questionIds = group.order;
      let questions: Question[] = [];
      await Promise.all(
        questionIds.map(async (id) => {
          const question = await Question.findOne({ where: { id: id } });
          questions = questions.concat(question!);
        })
      );
      return {
        group: group,
        questions: questions,
        startTime: constraints[0].startTime,
        endTime: constraints[0].endTime,
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
}

export default GroupResolver;
