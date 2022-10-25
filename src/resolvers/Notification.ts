import NotificationInput from "../types/inputs/notification";
import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import NotificationService from "../services/notification";
import { UserRole } from "../utils";

@Resolver()
class NotificationResolver {
  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  async createNotification(
    @Arg("NotificationData") notificationData: NotificationInput
  ) {
    try {
      // sending custom notification
      NotificationService.customNotif(notificationData);
      return true;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default NotificationResolver;
