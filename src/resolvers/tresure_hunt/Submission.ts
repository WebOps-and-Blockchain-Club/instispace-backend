import Submission from "../../entities/tresure_hunt/Submission";
import { Arg, Ctx, Mutation, Resolver, Authorized } from "type-graphql";
import { CreateSubmissionInput } from "../../types/inputs/treasure_hunt/submission";
import Question from "../../entities/tresure_hunt/Question";
import MyContext from "../../utils/context";
import User from "../../entities/User";
import Config from "../../entities/tresure_hunt/Config";

@Resolver(() => Submission)
class SubmissionResolver {
  @Mutation(() => Submission)
  @Authorized()
  async addSubmission(
    @Ctx() { user }: MyContext,
    @Arg("SubmissionData") submissionInput: CreateSubmissionInput,
    @Arg("QuestionId") questionId: string
  ) {
    try {
      // contraints
      const startTime = await Config.findOne({ where: { key: "startTime" } });
      const endTime = await Config.findOne({ where: { key: "endTime" } });
      const minMembers = await Config.findOne({ where: { key: "minMembers" } });

      const d = new Date();
      if (
        d.getTime() > new Date(startTime!.value).getTime() ||
        d.getTime() < new Date(endTime!.value).getTime()
      ) {
        throw new Error("Invalid Time");
      }

      // finding the question
      const question = await Question.findOne({ where: { id: questionId } });

      // assigning group
      const userN = await User.findOne({
        where: { id: user.id },
        relations: ["group", "group.users"],
      });
      const group = userN!.group;
      if (!group) throw new Error("Unregistered");

      if (group!.users.length < parseInt(minMembers!.value)) {
        throw new Error("Insufficient Members");
      }

      // images
      let images;
      if (submissionInput.imageUrls) {
        images = submissionInput.imageUrls.join(" AND ");
      }

      // saving the submmission
      const submissionCreated = await Submission.create({
        question: question,
        group: group,
        submittedBy: user,
        description: submissionInput.description,
        images: images === "" ? null : images,
      }).save();
      return submissionCreated;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default SubmissionResolver;
