import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    autoLoadEntities: true,
    subscribers: [],
    migrations: [],
};