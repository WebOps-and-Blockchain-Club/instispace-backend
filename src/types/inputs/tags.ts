import { Field, InputType } from "type-graphql";

@InputType()
class TagInput{
    @Field()
    title : string;
}

export default TagInput;