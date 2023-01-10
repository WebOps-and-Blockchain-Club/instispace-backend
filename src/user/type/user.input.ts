import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateUserInput {
    @Field()
    name: string;

    @Field()
    roll: string;
}

@InputType()
export class LoginInput {
    @Field()
    roll: string;

    @Field()
    pass: string;
}