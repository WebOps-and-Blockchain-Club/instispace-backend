import User from "../entities/User";
import { Authorized, FieldResolver, Query, Resolver, Root } from "type-graphql";
import Report from "../entities/Common/Report";
import Netop from "../entities/Netop";
import MyQuery from "../entities/MyQuery";

@Resolver(Report)
class ReportResolver {
  @Query(() => [Report], { nullable: true })
  @Authorized()
  async getReports() {
    let reports = await Report.find({
      relations: ["netop", "createdBy", "query"],
    });
    if (reports) {
      reports = reports.filter((report) => {
        if (report.netop) {
          return !report.netop.isHidden;
        } else if (report.query) {
          return !report.query.isHidden;
        }
        return false;
      });
    }
    return reports;
  }

  @FieldResolver(() => User)
  @Authorized()
  async createdBy(@Root() { id, createdBy }: Report) {
    if (createdBy) return createdBy;
    const report = await Report.findOne(id, { relations: ["createdBy"] });
    return report?.createdBy;
  }

  @FieldResolver(() => Netop, { nullable: true })
  @Authorized()
  async netop(@Root() { id, netop }: Report) {
    if (netop) return netop;
    const report = await Report.findOne(id, { relations: ["netop"] });
    return report?.netop;
  }

  @FieldResolver(() => MyQuery, { nullable: true })
  @Authorized()
  async query(@Root() { id, query }: Report) {
    if (query) return query;
    const report = await Report.findOne(id, { relations: ["query"] });
    return report?.query;
  }
}

export default ReportResolver;
