import Event from "../entities/Event";
import MyQuery from "../entities/MyQuery";
import Netop from "../entities/Netop";
import User from "../entities/User";
import Hostel from "../entities/Hostel";
import Item from "../entities/Item";
import { Notification, UserRole } from "../utils";
import { In } from "typeorm";
import firebaseClient from "./firebase";

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
        route: "EVENT",
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
        route: "NETOP",
      },
    });
  }

  async notifyNewCommentNetop(user: User, title: string, description: string) {
    let tokens = user.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (user.notifyNetopComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${title} got commented`,
          body: description,
          route: "NETOP",
        },
      });
    }
  }

  async notifyReportNetop(user: User, title: string, report: string) {
    let tokens = user.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (user.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${title} got reported`,
          body: report,
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
        route: "QUERY",
      },
    });
  }

  async notifyNewCommentQuery(user: User, title: string, description: string) {
    let tokens = user.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (user.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${title} got commented`,
          body: description,
          route: "QUERY",
        },
      });
    }
  }

  async notifyReportQuery(user: User, title: string, report: string) {
    let tokens = user.fcmToken.split(" AND ");
    tokens = tokens.filter((_t) => _t !== "" && _t !== null);

    if (user.notifyMyQueryComment && tokens.length !== 0) {
      this.firebase.sendMessage(tokens, {
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title: `${title} got reported`,
          body: report,
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
        route: "LnF",
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
        route: "HOSTEL",
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
        route: "HOSTEL",
      },
    });
  }
}

export default new NotificationService();

