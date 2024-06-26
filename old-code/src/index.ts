import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema, emitSchemaDefinitionFile } from "type-graphql";
import resolvers from "./resolvers/index";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import entities from "./entities";
import User from "./entities/User";
import jwt from "jsonwebtoken";
import authChecker from "./utils/authcheker";
import express from "express";
import cors from "cors";
//subscribe
import { createServer } from "http";

import { graphqlUploadExpress } from "graphql-upload";
import { FILE_SIZE_LIMIT_MB } from "./utils/config";

dotenv.config();

const main = async () => {
  
  const app = express();
  const httpServer = createServer(app);

  const schema = await buildSchema({ resolvers, authChecker });

  await emitSchemaDefinitionFile("./schema.gql", schema);

  const server = new ApolloServer({
    schema,
    context: async ({ req }: { req: any }) => {
      if (req.headers.apikey !== process.env.API_KEY) {
        throw new Error("Provide the Correct API-key!");
      }

      let user;
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization;
          const decoded: any = jwt.verify(
            token.split("Bearer ")[1],
            process.env.JWT_SECRET!
          );
          user = await User.findOne({ id: decoded });
        } catch (e) {
          throw new Error(`message ${e}`);
        }
      }
      return { user: user };
    },
  });

  await server.start();

  app.use(
    graphqlUploadExpress({
      maxFileSize: FILE_SIZE_LIMIT_MB * 1000000, // 10MB
      maxFiles: 5,
    })
  );

  app.use(
    cors({
      credentials: false,
    })
  );

  server.applyMiddleware({ app });

  app.use(express.static("public"));

  httpServer.listen(process.env.PORT || 8000, () =>
    console.log(`Server running: http://localhost:${process.env.PORT || 8000}`)
  );
};

createConnection({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  synchronize: true,
  ssl: process.env.IS_SSL === "true" ? true : false,
})
  .then(() => {
    console.log("Database connected");
    main();
  })
  .catch((e) => {
    console.log(e);
  });
