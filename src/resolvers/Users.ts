import { LoginInput } from "../types/inputs/users";
import { UserRole, usersDevList } from "../utils";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import jwt from "jsonwebtoken";
import UsersDev from "../entities/UsersDev";
import Users from "../entities/Users";
import { LoginOutput } from "../types/objects/users";

@Resolver()
class UsersResolver {
  @Query(() => String)
  async helloworld() {
    return "hello world";
  }

  @Mutation(() => LoginOutput)
  async login(@Arg("LoginInputs") { roll, pass }: LoginInput) {
    /************ Checking the user credentials ************/
    if (process.env.NODE_ENV === "development") {
      //If user development database is empty add few random users in database
      const usersDevCount = await UsersDev.count();
      if (usersDevCount === 0) {
        await Promise.all(
          usersDevList.map(async (_user) => {
            await UsersDev.create({ ..._user }).save();
          })
        );
      }

      //Check the user credentials in development database
      const ldapUser = await UsersDev.findOne({ where: { roll, pass } });
      if (!ldapUser) throw new Error("Invalid Credentials");
    } else {
      //Check with LDAP
      //TODO: Add function to check the credentials with LDAP
    }

    /************ Check the user details ************/
    const user = await Users.findOne({ roll });
    //If user doesn't exists
    if (!user) {
      const newUser = await Users.create({ roll }).save();
      const token = jwt.sign(newUser.id, process.env.JWT_SECRET!);
      return { isNewUser: true, role: UserRole.USER, token };
    }
    //If user exists
    else {
      const token = jwt.sign(user.id, process.env.JWT_SECRET!);
      return { isNewUser: false, role: UserRole.USER, token };
    }
  }
}

export default UsersResolver;
