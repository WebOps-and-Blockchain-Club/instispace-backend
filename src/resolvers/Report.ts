import User from "../entities/User";
import { Authorized, FieldResolver, Query, Resolver, Root } from "type-graphql";
import Report from "../entities/Common/Report";
import Netop from "../entities/Netop";

@Resolver(Report)
class ReportResolver {
  @Query(() => [Report], { nullable: true })
  async getReports() {
    return await Report.find({});
  }

  @FieldResolver(() => User)
  @Authorized()
  async createdBy(@Root() { id }: Report) {
    const report = await Report.findOne(id, { relations: ["createdBy"] });
    return report?.createdBy;
  }

  @FieldResolver(() => Netop)
  @Authorized()
  async netop(@Root() { id }: Report) {
    const report = await Report.findOne(id, { relations: ["netop"] });
    return report?.netop;
  }
}

export default ReportResolver;
