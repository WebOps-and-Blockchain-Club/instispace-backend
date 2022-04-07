import Poll from "../../entities/Polls/Poll";
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
import CreatePollInput from "../../types/inputs/poll";
import MyContext from "../../utils/context";
import PollOption from "../../entities/Polls/PollOption";
import { miliSecPerHour, userBatch, userDept, UserRole } from "../../utils";
import Hostel from "../../entities/Hostel";
import User from "../../entities/User";
import { ILike } from "typeorm";

@Resolver(() => Poll)
class PollsResolver {
  @Mutation(() => Boolean)
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.SECRETORY,
    UserRole.HOSTEL_SEC,
    UserRole.LEADS,
    UserRole.MODERATOR,
  ])
  async createPoll(
    @Ctx() { user }: MyContext,
    @Arg("CreatePollInput") pollInput: CreatePollInput,
    @Arg("HostelId", { nullable: true }) hostelId: string
  ) {
    try {
      const poll = new Poll();
      poll.question = pollInput.question;
      poll.createdBy = user;
      poll.duration = pollInput.duration;

      let options: PollOption[] = [];
      await Promise.all(
        pollInput.options.map(async (n) => {
          const option = new PollOption();
          option.description = n;
          await option.save();
          options.push(option);
        })
      );
      poll.options = options;

      if (pollInput.department) poll.department = pollInput.department;
      if (pollInput.batch) poll.batch = pollInput.batch.join();
      poll.pollType = pollInput.pollType;

      if (hostelId) {
        const hostel = await Hostel.findOne({ id: hostelId });
        if (!hostel) throw new Error("Invalid Hostel");
        poll.hostel = hostel;
      }

      const pollCreated = await poll.save();

      return !!pollCreated;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Poll])
  @Authorized()
  async getPolls(@Ctx() { user }: MyContext) {
    if (user.role !== UserRole.USER) {
      const polls = await Poll.find({
        where: { isHidden: false },
        order: { createdAt: "DESC" },
      });
      return polls;
    }

    let pollsList: Poll[] = [];
    const dept = userDept(user.roll);
    const batch = userBatch(user.roll);
    await Promise.all(
      ["batch"].map(async (field: string) => {
        const filter = { [field]: ILike(`%${batch}%`) };
        const pollF = await Poll.find({
          where: filter,
          order: { createdAt: "DESC" },
        });
        pollF.forEach((p) => {
          pollsList.push(p);
        });
      })
    );
    const d = new Date();
    pollsList.filter(
      (p) =>
        d.getTime() - p.createdAt.getTime() < p.duration * miliSecPerHour &&
        p.department === dept &&
        p.isLive === true &&
        p.isHidden === false
    );
    return pollsList;
  }

  @Mutation(() => Boolean, {
    description: "Mutation to create a Poll, Restrictions: {ALL Super Users}",
  })
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.SECRETORY,
    UserRole.HOSTEL_SEC,
    UserRole.LEADS,
    UserRole.MODERATOR,
  ])
  async deletePoll(@Ctx() { user }: MyContext, @Arg("PoleId") id: string) {
    try {
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["createdBy"],
      });
      if (
        poll &&
        ([UserRole.ADMIN, UserRole.HAS].includes(user.role) ||
          user.id === poll.createdBy.id)
      ) {
        const { affected } = await Poll.update(id, { isHidden: true });
        return affected === 1;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to End a Live Poll, Restrictions: {All super users, (Admin, HAS, can end any live poll)}",
  })
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.SECRETORY,
    UserRole.HOSTEL_SEC,
    UserRole.LEADS,
    UserRole.MODERATOR,
  ])
  async endLivePoll(@Ctx() { user }: MyContext, @Arg("PoleId") id: string) {
    try {
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["createdBy"],
      });
      if (
        poll &&
        ([UserRole.ADMIN, UserRole.HAS].includes(user.role) ||
          user.id === poll.createdBy.id)
      ) {
        const { affected } = await Poll.update(id, { isLive: false });
        return affected === 1;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [PollOption])
  async options(@Root() { id, options }: Poll) {
    try {
      if (options) return options;
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["options"],
      });
      return poll?.options;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Number)
  async totalAnswers(@Root() { id, answeredBy }: Poll) {
    try {
      if (answeredBy) return answeredBy.length;
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["answeredBy"],
      });
      if (!poll) return 0;
      return poll.answeredBy.length;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [User])
  async answeredBy(@Root() { id, answeredBy }: Poll) {
    try {
      if (answeredBy) return answeredBy;
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["answeredBy"],
      });
      return poll?.answeredBy;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Poll) {
    try {
      if (createdBy) return createdBy;
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["createdBy"],
      });
      return poll?.createdBy;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel)
  async hostel(@Root() { id, hostel }: Poll) {
    try {
      if (hostel) return hostel;
      const poll = await Poll.findOne({
        where: { id: id },
        relations: ["hostel"],
      });
      return poll?.hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default PollsResolver;
