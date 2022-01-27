import { NotificationPayload, Notification } from "../types/objects/subs";
import {
  Arg,
  Mutation,
  PubSub,
  PubSubEngine,
  Root,
  Subscription,
} from "type-graphql";
import Netop from "../entities/Netop";

class sampleRes {
  private autoIncrement = 0;

  @Mutation(() => Boolean)
  async pubSubMutation(
    @PubSub() pubSub: PubSubEngine,
    @Arg("message", { nullable: true }) message?: string
  ): Promise<boolean> {
    const payload: NotificationPayload = { id: ++this.autoIncrement, message };
    await pubSub.publish("NOTIFICATIONS", payload);
    return true;
  }

  @Subscription({ topics: "NOTIFICATIONS" })
  normalSubscription(
    @Root() { id, message }: NotificationPayload
  ): Notification {
    return { id, message, date: new Date() };
  }

  @Subscription({ topics: "tech" })
  createNetopSubsTech(@Root() netop: Netop): Netop {
    return netop;
  }
}

export default sampleRes;
