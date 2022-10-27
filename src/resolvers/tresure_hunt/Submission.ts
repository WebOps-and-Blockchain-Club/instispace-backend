import Submission from "../../entities/tresure_hunt/Submission";
import { UserRole } from "../../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { CreateSubmissionInput } from "../../types/inputs/treasure_hunt/submission";
import Question from "../../entities/tresure_hunt/Question";
import MyContext from "../../utils/context";
import User from "../../entities/User";
import Config from "../../entities/tresure_hunt/Config";

@Resolver(() => Submission)
class SubmissionResolver {
  @Mutation(() => Submission)
  @Authorized([UserRole.ADMIN])
  async addSubmission(
    @Ctx() { user }: MyContext,
    @Arg("SubmissionData") submissionInput: CreateSubmissionInput,
    @Arg("QuestionId") questionId: string
  ) {
    try {
      // contraints
      const constraints = await Config.find();

      const d = new Date();
      if (
        d.getTime() > constraints[0].endTime.getTime() ||
        d.getTime() < constraints[0].startTime.getTime()
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

      if (group!.users.length < constraints[0].minMembers) {
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
