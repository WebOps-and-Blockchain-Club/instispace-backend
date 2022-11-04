import Event from "../entities/Event";
import MyQuery from "../entities/MyQuery";
import Netop from "../entities/Netop";
import User from "../entities/User";
import Hostel from "../entities/Hostel";
import Item from "../entities/Item";
import { Notification, UserRole } from "../utils";
import { In } from "typeorm";
import firebaseClient from "./firebase";
import NotificationInput from "../types/inputs/notification";

class NotificationService {
  private firebase = firebaseClient;

  async notifyNewEvent(event: Event) {
    let users = await User.find({
      where: {
        isNewUser: false,
        notifyEvent: In([Notification.FOLLOWED_TAGS, Notification.FORALL]),
      },
      relations: ["interest"],
    });

    users = users.filter(
      (_user) =>
        _user.notifyEvent === Notification.FORALL ||
        (_user.notifyEvent === Notification.FOLLOWED_TAGS &&
          _user.interest?.filter(
            (_tag) =>
              event.tags.filter((_eTag) => _eTag.id === _tag.id).length !== 0
          ).length !== 0)
    );

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: event.title,
        body: event.content,
        route: `event/${event.id}` ,
      },
    });
  }

  async notifyNewNetop(netop: Netop) {
    let users = await User.find({
      where: {
        isNewUser: false,
        notifyNetop: In([Notification.FOLLOWED_TAGS, Notification.FORALL]),
      },
      relations: ["interest"],
    });

    users = users.filter(
      (_user) =>
        _user.notifyNetop === Notification.FORALL ||
        (_user.notifyNetop === Notification.FOLLOWED_TAGS &&
          _user.interest?.filter(
            (_tag) =>
              netop.tags.filter((_eTag) => _eTag.id === _tag.id).length !== 0
          ).length !== 0)
    );

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: netop.title,
        body: netop.content,
        route: `netop/${netop.id}`,
      },
    });
  }

  async notifyNewCommentNetop(netop: Netop, description: string) {
    let tokens = netop.createdBy.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (netop.createdBy.notifyNetopComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${netop.title} got commented`,
          body: description,
          route: `netop/${netop.id}`,
        },
      });
    }
  }

  async notifyReportNetop(netop: Netop, report: string) {
    let tokens = netop.createdBy.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (netop.createdBy.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${netop.title} got reported`,
          body: report,
	  route: `netop/${netop.id}`,
        },
      });
    }
  }

  async notifyNewQuery(query: MyQuery) {
    let users = await User.find({
      where: {
        isNewUser: false,
        notifyMyQuery: true,
      },
    });

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: query.title,
        body: query.content,
        route: `query/${query.id}`,
      },
    });
  }

  async notifyNewCommentQuery(query: MyQuery, description: string) {
    let tokens = query.createdBy.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (query.createdBy.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${query.title} got commented`,
          body: description,
          route: `query/${query.id}`,
        },
      });
    }
  }

  async notifyReportQuery(query: MyQuery, report: string) {
    let tokens = query.createdBy.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (query.createdBy.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${query.title} got reported`,
          body: report,
	  route: `query/${query.id}`,
        },
      });
    }
  }

  async notifyReportModerator(title: string, report: string) {
    const users = await User.find({
      where: {
        isNewUser: false,
        role: In([UserRole.HAS, UserRole.SECRETARY, UserRole.MODERATOR]),
      },
    });

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: `${title} got reported`,
        body: report,
	route: "admin-reports",
      },
    });
  }

  async notifyFound(item: Item) {
    let users = await User.find({
      where: {
        isNewUser: false,
        notifyFound: true,
      },
    });

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: `FOUND ${item.name}`,
        body: `At ${item.location}`,
        route: `lostnfound/${item.id}`,
      },
    });
  }

  async notifyNewAnnouncement(
    hostelId: string[],
    title: string,
    description: string
  ) {
    const hostels = await Hostel.find({
      where: { id: In(hostelId) },
      relations: ["users"],
    });

    let tokens: string[] = [];
    hostels.map((_hostel) =>
      _hostel.users.map(
        (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
      )
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: `New Announcement: ${title}`,
        body: description,
        route: "hostel",
      },
    });
  }

  async notifyNewAmenities(hostelId: string, title: string) {
    const hostel = await Hostel.findOne(hostelId, { relations: ["users"] });

    let tokens: string[] = [];
    hostel?.users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: "Hostel Update!",
        body: `New amenity: ${title}`,
        route: "hostel",
      },
    });
  }

  async customNotif(notificationData: NotificationInput) {
    let filter: any = {
      isNewUser: false,
      role: In(notificationData.roles),
    };
    if (notificationData.rolls && notificationData.rolls.length !== 0) {
      filter = { ...filter, roll: In(notificationData.rolls) };
    }

    let users = await User.find({
      where: filter,
    });

    let tokens: string[] = [];
    users.map(
      (_user) => (tokens = tokens.concat(_user.fcmToken.split(" AND ")))
    );
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);
    if (tokens.length === 0) return;

    this.firebase.sendMessage(tokens, {
      data: {
	id: `${Math.floor(Math.random() * (100))}`,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title: notificationData.title,
        body: notificationData.body,
        route: "NONE",
        image: notificationData.imageUrl,
      },
    });
  }
}

export default new NotificationService();
