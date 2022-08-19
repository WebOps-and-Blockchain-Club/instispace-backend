import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import MyContext from "../utils/context";
import { fileringConditions } from "../types/inputs/netop";
import Tag from "../entities/Tag";
import { EditDelPermission, UserRole } from "../utils";
import User from "../entities/User";
import Event from "../entities/Event";
import { createEventInput, editEventInput } from "../types/inputs/event";
import getEventOutput from "../types/objects/event";
import fcm from "../utils/fcmTokens";
import { Notification } from "../utils/index";
import { ILike } from "typeorm";

@Resolver(Event)
class EventResolver {
  @Mutation(() => Event, {
    description: "Mutation to create an event",
  })
  @Authorized(
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.SECRETARY,
    UserRole.HAS,
    UserRole.MODERATOR,
    UserRole.HOSTEL_SEC
  )
  async createEvent(
    @Arg("NewEventData") createEventInput: createEventInput,
    @Ctx() { user }: MyContext
  ): Promise<Event> {
    try {
      var tags: Tag[] = [];
      let iUsers: User[] = [];

      await Promise.all(
        createEventInput.tagIds.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["event", "users"] });
          if (tag) {
            tags = tags.concat([tag]);
            iUsers = iUsers.concat(tag.users);
          }
        })
      );

      if (tags.length !== createEventInput.tagIds.length)
        throw new Error("Invalid tagIds");
      createEventInput.tags = tags;

      let imageUrls;
      if (createEventInput.imageUrls) {
        imageUrls = createEventInput.imageUrls?.join(" AND ");
      }

      const event = await Event.create({
        ...createEventInput,
        createdBy: user,
        time: new Date(createEventInput.time),
        photo: imageUrls === "" ? null : imageUrls,
        tags,
      }).save();

      const users1 = await User.find({
        where: { notifyEvent: Notification.FORALL },
      });
      if (users1) iUsers = iUsers.concat(users1);

      let iUsersIds = iUsers.map((u) => u.fcmToken);

      const iUsersSet = new Set<string>(iUsersIds);
      iUsersIds = Array.from(iUsersSet);

      iUsers = [];

      await Promise.all(
        iUsersIds.map(async (ft) => {
          const u = await User.findOneOrFail({
            where: { fcmToken: ft },
          });
          if (u.notifyEvent !== Notification.NONE && u.id != user.id)
            iUsers.push(u);
        })
      );

      if (!!event) {
        iUsers.map((u) => {
          u.fcmToken &&
            u.fcmToken.split(" AND ").map(async (ft) => {
              const message = {
                to: ft,
                notification: {
                  title: `Hi ${u.name}`,
                  body: "you may interested in this event",
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
        });
      }
      return event;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Event, {
    description: "Edit the event by id",
  })
  @Authorized()
  async editEvent(
    @Arg("EventId") eventId: string,
    @Ctx() { user }: MyContext,
    @Arg("EditEventData") editEventInput: editEventInput
  ) {
    try {
      const event = await Event.findOne(eventId, {
        relations: ["tags", "createdBy"],
      });

      if (
        event &&
        (user.id === event?.createdBy.id ||
          [UserRole.ADMIN, UserRole.SECRETARY, UserRole.HAS].includes(
            user.role
          ))
      ) {
        let imageUrlStr = [...(editEventInput.imageUrls ?? [])].join(" AND ");
        event.photo = imageUrlStr === "" ? null : imageUrlStr;

        if (editEventInput.tagIds) {
          let tags: Tag[] = [];
          await Promise.all(
            editEventInput.tagIds.map(async (id) => {
              const tag = await Tag.findOne(id, { relations: ["event"] });
              if (tag) tags.push(tag);
            })
          );
          event.tags = tags;
        }

        if (editEventInput.title) event.title = editEventInput.title;
        if (editEventInput.content) event.content = editEventInput.content;
        if (editEventInput.location) event.location = editEventInput.location;
        if (editEventInput.time) event.time = new Date(editEventInput.time);
        if (editEventInput.linkName) event.linkName = editEventInput.linkName;
        if (editEventInput.linkToAction)
          event.linkToAction = editEventInput.linkToAction;

        const eventUpdated = await event.save();
        return eventUpdated;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Delete the event by id, Restrictions:{CREATED USER, ADMIN, SECRETARY, HAS}",
  })
  @Authorized()
  async deleteEvent(
    @Arg("EventId") eventId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const event = await Event.findOneOrFail(eventId, {
        relations: ["createdBy"],
      });
      if (
        event.createdBy.id === user.id ||
        [UserRole.ADMIN, UserRole.SECRETARY, UserRole.HAS].includes(user.role)
      ) {
        const { affected } = await Event.update(eventId, { isHidden: true });
        return affected === 1;
      } else throw Error("Unauthorized");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "ILike or Unlike the event, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async toggleLikeEvent(
    @Arg("EventId") eventId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const event = await Event.findOne(eventId, { relations: ["likedBy"] });
      if (event) {
        if (event.likedBy.filter((u) => u.id === user.id).length)
          event.likedBy = event.likedBy.filter((e) => e.id !== user.id);
        else event.likedBy.push(user);

        const eventUpdated = await event.save();
        return !!eventUpdated;
      } else {
        throw new Error("Invalid event id");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "Star or Unstar the event, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async toggleStarEvent(
    @Arg("EventId") eventId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const event = await Event.findOne(eventId, { relations: ["staredBy"] });
      if (event) {
        if (event.staredBy.filter((u) => u.id === user.id).length)
          event.staredBy = event.staredBy.filter((e) => e.id !== user.id);
        else event.staredBy.push(user);

        const eventUpdate = await event.save();
        return !!eventUpdate;
      } else {
        throw new Error("Invalid event id");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => Event, {
    description:
      "Get the event details by id, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async getEvent(@Arg("EventId") eventId: string) {
    try {
      const event = await Event.findOne(eventId);
      const d = new Date();
      d.setHours(d.getHours() - 2);
      if (
        event &&
        !event.isHidden &&
        new Date(event.time).getTime() > d.getTime()
      )
        return event;
      else return null;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => getEventOutput, {
    description:
      "Get the list of event details with filters, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async getEvents(
    @Ctx() { user }: MyContext,
    @Arg("lastEventId") lastEventId: string,
    @Arg("take") take: number,
    @Arg("FileringCondition", { nullable: true })
    fileringConditions?: fileringConditions,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      var eventList: Event[] = [];

      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`), isHidden: false };
            const eventF = await Event.find({
              where: filter,
              relations: ["tags", "likedBy", "staredBy"],
              order: { createdAt: "DESC" },
            });
            eventF.forEach((event) => {
              eventList.push(event);
            });
          })
        );
      } else {
        eventList = await Event.find({
          where: { isHidden: false },
          relations: ["tags", "likedBy", "staredBy"],
          order: { createdAt: "DESC" },
        });
      }

      const d = new Date();
      d.setHours(d.getHours() - 2); //Filter the events after the 2 hours time of completion
      if (fileringConditions && fileringConditions.isStared) {
        eventList = eventList.filter((n) => {
          return fileringConditions.tags && fileringConditions.tags.length
            ? n.staredBy.filter((u) => u.id === user.id).length &&
                new Date(n.time).getTime() > d.getTime() &&
                n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
                  .length
            : n.staredBy.filter((u) => u.id === user.id).length &&
                new Date(n.time).getTime() > d.getTime();
        });
      } else if (
        fileringConditions &&
        fileringConditions.tags &&
        fileringConditions.tags.length
      ) {
        eventList = eventList.filter(
          (n) =>
            new Date(n.time).getTime() > d.getTime() &&
            n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
              .length
        );
      } else {
        eventList = eventList.filter(
          (n) => new Date(n.time).getTime() > d.getTime()
        );
      }

      const total = eventList.length;

      if (orderByLikes) {
        eventList.sort((a, b) =>
          a.likedBy.length > b.likedBy.length
            ? -1
            : a.likedBy.length < b.likedBy.length
            ? 1
            : 0
        );
      } else {
        eventList.sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
        );
      }

      var finalList;

      if (lastEventId) {
        const index = eventList.map((n) => n.id).indexOf(lastEventId);
        finalList = eventList.splice(index + 1, take);
      } else {
        finalList = eventList.splice(0, take);
      }
      return { list: finalList, total };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => Number, {
    description: "Get Number of likes of an Event",
  })
  async likeCount(@Root() { id }: Event) {
    const event = await Event.findOneOrFail(id, { relations: ["likedBy"] });
    const likeCount = event.likedBy.length;
    return likeCount;
  }

  @FieldResolver(() => [Tag], {
    description: "Get the list of Tags added for an Event",
  })
  async tags(@Root() { id, tags }: Event) {
    if (tags) return tags;
    const netop = await Event.findOne(id, {
      relations: ["tags"],
    });
    return netop?.tags;
  }

  @FieldResolver(() => Boolean, {
    description: "Returns true if the User has stared this Event, else false",
  })
  async isStared(@Root() { id, staredBy }: Event, @Ctx() { user }: MyContext) {
    if (staredBy) staredBy.filter((u) => u.id === user.id).length;
    const event = await Event.findOne(id, { relations: ["staredBy"] });
    return event?.staredBy?.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => Boolean, {
    description: "Returns true if the User has likes this Event, else false",
  })
  async isLiked(@Root() { id, likedBy }: Event, @Ctx() { user }: MyContext) {
    if (likedBy) return likedBy.filter((u) => u.id === user.id).length;
    const event = await Event.findOne(id, { relations: ["likedBy"] });
    return event?.likedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Event) {
    if (createdBy) return createdBy;
    const event = await Event.findOne(id, { relations: ["createdBy"] });
    return event?.createdBy;
  }

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Event
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [];
      const event = await Event.findOne(id, {
        relations: ["createdBy"],
      });
      if (
        event &&
        ([UserRole.ADMIN, UserRole.SECRETARY, UserRole.HAS].includes(
          user.role
        ) ||
          user.id === event.createdBy.id)
      )
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default EventResolver;
