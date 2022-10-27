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

  @FieldResolver(() => [Submission])
  async submissions(
    @Ctx() { user }: MyContext,
    @Root() { id, submissions }: Question
  ) {
    try {
      if (submissions)
        return submissions.filter((s) => s.group.id === user.group.id);
      let question = await Question.findOne({
        where: { id: id },
        relations: ["submissions", "submissions.submitedBy"],
      });
      return question!.submissions.filter((s) => s.group.id === user.group.id);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default QuestionResolver;
