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
import { sheetLink } from "../utils/config.json";

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
    const feedback = await Feedback.create({ ...feedbackInput, user }).save();
    const appended = writeSheet(
      user.roll,
      user.name,
      feedbackInput.rating1,
      feedbackInput.rating2,
      feedbackInput.rating3,
      feedbackInput.ans1,
      feedbackInput.ans2,
      feedbackInput.ans3
    );
    return !!feedback && !!appended;
  }

  @Query(() => String, {
    description: "Query to return the spread-sheet link, Restrictions: {ADMIN}",
  })
  @Authorized([UserRole.ADMIN])
  async getSheetLink() {
    return sheetLink;
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
