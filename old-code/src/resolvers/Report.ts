import User from "../entities/User";
import {
  Arg,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Report from "../entities/Common/Report";
import Netop from "../entities/Netop";
import MyQuery from "../entities/MyQuery";
import { UserRole } from "../utils/index";
// import fcm from "../utils/fcmTokens";
import Reason from "../entities/Common/Reason";
import ReasonInput from "../types/inputs/report";
import { GetReportsOutput } from "../types/objects/report";

@Resolver(Report)
class ReportResolver {
  @Mutation(() => Reason)
  @Authorized([UserRole.ADMIN])
  async createReportReason(@Arg("ReportData") reasonInput: ReasonInput) {
    try {
      const reportCreated = await Reason.create({ ...reasonInput }).save();
      return reportCreated;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Reason])
  async getReportReasons() {
    try {
      return await Reason.find();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => GetReportsOutput, { nullable: true })
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.SECRETARY,
    UserRole.MODERATOR,
  ])
  async getReports() {
    try {
      let netops = await Netop.find({
        order: { createdAt: "DESC" },
        relations: ["reports"],
      });
      let queries = await MyQuery.find({
        order: { createdAt: "DESC" },
        relations: ["reports"],
      });

      netops = netops.filter((n) => n.reports.length !== 0);
      queries = queries.filter((n) => n.reports.length !== 0);

      netops.sort((a, b) =>
        a.reports.slice(-1)[0].createdAt > b.reports.slice(-1)[0].createdAt
          ? -1
          : a.reports.slice(-1)[0].createdAt < b.reports.slice(-1)[0].createdAt
          ? 1
          : 0
      );
      queries.sort((a, b) =>
        a.reports.slice(-1)[0].createdAt > b.reports.slice(-1)[0].createdAt
          ? -1
          : a.reports.slice(-1)[0].createdAt < b.reports.slice(-1)[0].createdAt
          ? 1
          : 0
      );

      return { netops, queries };
    } catch (error) {
      throw new Error(error);
    }
  }

  @FieldResolver(() => User)
  @Authorized()
  async createdBy(@Root() { id, createdBy }: Report) {
    if (createdBy) return createdBy;
    const report = await Report.findOneOrFail(id, { relations: ["createdBy"] });
    return report.createdBy;
  }

  @FieldResolver(() => Netop, { nullable: true })
  @Authorized()
  async netop(@Root() { id, netop }: Report) {
    if (netop) return netop;
    const report = await Report.findOneOrFail(id, { relations: ["netop"] });
    return report.netop;
  }

  @FieldResolver(() => MyQuery, { nullable: true })
  @Authorized()
  async query(@Root() { id, query }: Report) {
    if (query) return query;
    const report = await Report.findOneOrFail(id, { relations: ["query"] });
    return report.query;
  }
}

export default ReportResolver;
