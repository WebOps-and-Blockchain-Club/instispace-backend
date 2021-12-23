import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import entities from "./entities";
import User from "./entities/User";
import jwt from "jsonwebtoken";
import authChecker from "./utils/authcheker";

dotenv.config();

const main = async () => {
  const schema = await buildSchema({ resolvers, authChecker });

  const server = new ApolloServer({
    schema,
    context: async ({ req }: { req: any }) => {
      let user;
      if (req.headers.authorization) {
        const token = req.headers.authorization;
        const decoded: any = jwt.verify(
          token.split("Bearer ")[1],
          process.env.JWT_SECRET!
        );
        user = await User.findOne({ id: decoded });
      }
      return { user: user };
    },
  });

  server
    .listen(process.env.PORT || 8000)
    .then(({ url }) => console.log(`Server running at ${url}`))
    .catch((e) => {
      console.log(e);
    });
};

createConnection({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  synchronize: true,
  logging: true,
  ssl: true,
})
  .then(() => {
    console.log("Database connected");
    main();
  })
  .catch((e) => {
    console.log(e);
  });
