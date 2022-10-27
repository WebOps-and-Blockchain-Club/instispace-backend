import Submission from "../../entities/Tresure Hunt/Submission";
import { UserRole } from "../../utils";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { CreateSubmissionInput } from "../../types/inputs/Treasure Hunt/Submission";
import Question from "../../entities/Tresure Hunt/Question";
import MyContext from "../../utils/context";
import User from "../../entities/User";

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
      // finding the question
      const question = await Question.findOne({ where: { id: questionId } });

      // assigning group
      const userN = await User.findOne({
        where: { id: user.id },
        relations: ["group"],
      });
      const group = userN!.group;
      if (!group) throw new Error("Unregistered");

      if (group!.users.length < 4) {
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
