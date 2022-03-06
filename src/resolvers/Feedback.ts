import Feedback from "../entities/Feedback";
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
import MyContext from "../utils/context";
import { UserRole } from "../utils";
import User from "../entities/User";
import AddFeedbackInput from "../types/inputs/feedback";
import { writeSheet } from "../utils/googleSheets";

@Resolver((_type) => Feedback)
class FeedbackResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to add a feedback, Restrictions: {anyone who is authorized}",
  })
  @Authorized()
  async addFeedback(
    @Ctx() { user }: MyContext,
    @Arg("AddFeedback") feedbackInput: AddFeedbackInput
  ) {
    const feedback = new Feedback();
    feedback.ans1 = feedbackInput.ans1;
    feedback.ans2 = feedbackInput.ans2;
    feedback.ans3 = feedbackInput.ans3;
    feedback.user = user;
    const feedbackCreated = await feedback.save();
    writeSheet(
      user.roll,
      user.name,
      feedback.ans1,
      feedback.ans2,
      feedback.ans3
    );
    return !!feedbackCreated;
  }

  @Query(() => [Feedback], {
    description: "Query to fetch all feedbacks, Restrictions: {Admins}",
  })
  @Authorized([UserRole.ADMIN])
  async getAllFeedbacks(
    @Arg("LastAnnouncementId") lastFeedbackId: string,
    @Arg("take") take: number
  ) {
    try {
      let feedbackList = await Feedback.find({ order: { createdAt: "DESC" } });
      if (lastFeedbackId) {
        const index = feedbackList.map((n) => n.id).indexOf(lastFeedbackId);
        feedbackList = feedbackList.splice(index + 1, take);
        feedbackList = feedbackList.splice(index + 1, take);
      } else {
        feedbackList = feedbackList.splice(0, take);
      }
      return feedbackList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User)
  async user(@Root() { id, user }: Feedback) {
    if (user) return user;
    const feedback = await Feedback.findOne({
      where: { id },
      relations: ["user"],
    });
    return feedback?.user;
  }
}

export default FeedbackResolver;
