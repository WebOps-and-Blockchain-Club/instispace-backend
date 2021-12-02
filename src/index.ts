import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import entities from "./entities";

dotenv.config();

const main = async () => {
  const schema = await buildSchema({ resolvers });

  const server = new ApolloServer({ schema });

  server
    .listen(8000)
    .then(({ url }) => console.log(`Server running at ${url}`));
};

createConnection({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  synchronize: true,
  logging: true,
})
  .then(() => {
    console.log("Database connected");
    main();
  })
  .catch((e) => {
    console.log(e);
  });
