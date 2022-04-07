import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import MyContext from "../../utils/context";
import PollOption from "../../entities/Polls/PollOption";
import User from "../../entities/User";
import Poll from "../../entities/Polls/Poll";

@Resolver(() => PollOption)
class PollOptionResolver {
  @Mutation(() => Boolean, {
    description:
      "upvote or unupvote (if it's previously upvoted) a Poll, Restrictions:{any authorized user}",
  })
  @Authorized()
  async toggleUpvotes(
    @Arg("PollId") poleId: string,
    @Arg("OptionId") optionId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const poll = await Poll.findOne({
        where: { id: poleId },
        relations: ["answeredBy"],
      });
      if (!poll || poll.isLive === false)
        throw new Error("Pole not live of invalid Poll");
      if (poll.answeredBy.filter((u) => u.id === user.id).length === 0)
        poll.answeredBy.push(user);
      const pollUpdated = await poll.save();

      const pollOption = await PollOption.findOne(optionId, {
        relations: ["upvotedBy", "poll"],
      });

      if (pollOption && pollOption.poll.id === poll.id) {
        if (pollOption.upvotedBy.filter((u) => u.id === user.id).length) {
          pollOption.upvotedBy = pollOption.upvotedBy.filter(
            (e) => e.id !== user.id
          );
        } else {
          pollOption.upvotedBy.push(user);
        }
        const pollOptionUpdated = await pollOption.save();
        return !!(pollUpdated && pollOptionUpdated);
      }
      throw new Error("Invalid Option id");
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => Boolean, {
    description: "check if network and opportunity is liked by current user",
  })
  async isUpvoted(
    @Root() { id, upvotedBy }: PollOption,
    @Ctx() { user }: MyContext
  ) {
    if (upvotedBy) return upvotedBy.filter((u) => u.id === user.id).length;
    const pollOption = await PollOption.findOne(id, {
      relations: ["upvotedBy"],
    });
    return pollOption?.upvotedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => Number)
  async upvoteCount(@Root() { id, upvotedBy }: PollOption) {
    try {
      if (upvotedBy) return upvotedBy.length;
      const pollOption = await PollOption.findOne(id, {
        relations: ["upvotedBy"],
      });
      if (!pollOption) return 0;
      return pollOption.upvotedBy.length;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [User])
  async upvotedBy(@Root() { id, upvotedBy }: PollOption) {
    try {
      if (upvotedBy) return upvotedBy;
      const pollOption = await PollOption.findOne({
        where: { id: id },
        relations: ["upvotedBy"],
      });
      return pollOption?.upvotedBy;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Poll)
  async poll(@Root() { id, poll }: PollOption) {
    try {
      if (poll) return poll;
      const pollOption = await PollOption.findOne({
        where: { id: id },
        relations: ["poll"],
      });
      return pollOption?.poll;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default PollOptionResolver;
