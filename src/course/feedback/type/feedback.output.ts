import { Field, ObjectType } from "@nestjs/graphql";
import { Feedback } from "../feedback.entity";



@ObjectType('getallfeedback')
class getallfeedback {
    @Field(() => [Feedback], { nullable: true })
    list: Feedback[];

    @Field(() => Number)
    total: number;
}

export default getallfeedback;