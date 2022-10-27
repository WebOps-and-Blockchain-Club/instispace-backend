import Question from "../../entities/tresure_hunt/Question";
import { UserRole } from "../../utils";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { CreateQuestionInput } from "../../types/inputs/treasure_hunt/question";
import MyContext from "../../utils/context";
import Submission from "../../entities/tresure_hunt/Submission";
import User from "../../entities/User";

@Resolver(() => Question)
class QuestionResolver {
  @Mutation(() => Question)
  @Authorized([UserRole.ADMIN])
  async createQuestion(
    @Arg("QuestionData") questionInput: CreateQuestionInput
  ) {
    try {
      let images;
      if (questionInput.imageUrls) {
        images = questionInput.imageUrls.join(" AND ");
      }
      const questionCreated = await Question.create({
        description: questionInput.description,
        images: images === "" ? null : images,
      }).save();
      return questionCreated;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => Submission)
  async submission(@Ctx() { user }: MyContext, @Root() { id }: Question) {
    try {
      let userN = await User.findOne({
        where: { id: user.id },
        relations: ["group"],
      });

      let question = await Question.findOne({
        where: { id: id },
        relations: ["submissions", "submissions.submittedBy"],
      });
      return question!.submissions.filter(
        (s) => s.group.id === userN!.group.id
      )[0];
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default QuestionResolver;
