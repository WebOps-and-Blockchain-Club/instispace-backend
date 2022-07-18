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
import { ReportStatus, UserRole } from "../utils/index";
import fcm from "../utils/fcmTokens";

@Resolver(Report)
class ReportResolver {
  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETORY])
  async resolveReport(
    @Arg("id") id: string,
    @Arg("status") status: ReportStatus
  ) {
    try {
      const report = await Report.findOneOrFail(id, {
        relations: ["netop", "query", "netop.createdBy", "query.createdBy"],
      });
      if (report.netop) {
        const { affected } = await Netop.update(report.netop.id, {
          isHidden: status === ReportStatus.REPORT_ACCEPTED ? true : false,
        });
        if (affected !== 1) throw new Error("Update failed");

        let { affected: reportAffected } = await Report.update(id, { status });
        if (reportAffected !== 1) throw new Error("Update failed");

        const creator = report.netop.createdBy;
        creator.fcmToken.split(" AND ").map((ft) => {
          const message = {
            to: ft,
            notification: {
              title: `Hi ${creator.roll}`,
              body:
                status === ReportStatus.REPORT_REJECTED
                  ? "your netop got resolved and now its displayed"
                  : "your netop got reported",
            },
          };

          fcm.send(message, (err: any, response: any) => {
            if (err) {
              console.log("Something has gone wrong!" + err);
              console.log("Respponse:! " + response);
            } else {
              // showToast("Successfully sent with response");
              console.log("Successfully sent with response: ", response);
            }
          });
        });
        return affected === 1 && reportAffected === 1;
      } else if (report.query) {
        const { affected } = await Netop.update(report.query.id, {
          isHidden: status === ReportStatus.REPORT_ACCEPTED ? true : false,
        });
        if (affected !== 1) throw new Error("Update failed");

        let { affected: reportAffected } = await Report.update(id, { status });
        if (reportAffected !== 1) throw new Error("Update failed");

        const creator = report.query.createdBy;
        creator.fcmToken.split(" AND ").map((ft) => {
          const message = {
            to: ft,
            notification: {
              title: `Hi ${creator.roll}`,
              body:
                status === ReportStatus.REPORT_REJECTED
                  ? "your query got resolved and now its displayed"
                  : "your query got reported",
            },
          };

          fcm.send(message, (err: any, response: any) => {
            if (err) {
              console.log("Something has gone wrong!" + err);
              console.log("Respponse:! " + response);
            } else {
              // showToast("Successfully sent with response");
              console.log("Successfully sent with response: ", response);
            }
          });
        });
        return affected === 1 && reportAffected === 1;
      } else throw new Error("Not Accepted");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => [Report], { nullable: true })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETORY])
  async getReports() {
    let reports = await Report.find({
      order: { createdAt: "DESC" },
    });
    return reports;
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
