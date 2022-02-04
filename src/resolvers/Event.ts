import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";

import MyContext from "../utils/context";
import { fileringConditions } from "../types/inputs/netop";
import Tag from "../entities/Tag";
import { GraphQLUpload, Upload } from "graphql-upload";
import { UserRole } from "../utils";
import addAttachments from "../utils/uploads";
import User from "../entities/User";
import Event from "../entities/Event";
import { createEventInput, editEventInput } from "../types/inputs/event";
import getEventOutput from "../types/objects/event";

@Resolver(Event)
class EventResolver {
  @Mutation(() => Boolean, {
    description: "Mutation to create an event",
  })
  @Authorized(
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.SECRETORY,
    UserRole.HAS,
    UserRole.MODERATOR,
    UserRole.HOSTEL_SEC
  )
  async createEvent(
    @PubSub() pubSub: PubSubEngine,
    @Arg("NewEventData") createEventInput: createEventInput,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<boolean> {
    try {
      var tags: Tag[] = [];
      await Promise.all(
        createEventInput.tagIds.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["event"] });
          if (tag) tags = tags.concat([tag]);
        })
      );
      if (tags.length !== createEventInput.tagIds.length)
        throw new Error("Invalid tagIds");
      createEventInput.tags = tags;

      if (image)
        createEventInput.photo = (await addAttachments([image], true)).join(
          " AND "
        );
      if (attachments)
        createEventInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      const event = await Event.create({
        ...createEventInput,
        createdBy: user,
        isHidden: false,
        time: new Date(createEventInput.time),
        tags,
      }).save();

      const payload = event;
      tags.forEach(async (t) => {
        await pubSub.publish(t.title, payload);
      });

      return !!event;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "Edit the event by id",
  })
  @Authorized()
  async editEvent(
    @Arg("EventId") eventId: string,
    @Ctx() { user }: MyContext,
    @Arg("EditEventData") editEventInput: editEventInput,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const event = await Event.findOne(eventId, {
        relations: ["tags", "createdBy"],
      });

      if (
        event &&
        (user.id === event?.createdBy.id ||
          [UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS].includes(
            user.role
          ))
      ) {
        if (image)
          event.photo = (await addAttachments([image], true)).join(" AND ");

        if (attachments)
          event.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");

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
        if (editEventInput.time) event.time = new Date(editEventInput.time);
        if (editEventInput.linkName) event.linkName = editEventInput.linkName;
        if (editEventInput.linkToAction)
          event.linkToAction = editEventInput.linkToAction;

        const eventUpdated = await event.save();
        return !!eventUpdated;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Delete the event by id, Restrictions:{CREATED USER, ADMIN, SECRETORY, HAS}",
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
        [UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS].includes(user.role)
      ) {
        const { affected } = await Event.update(eventId, { isHidden: true });
        return affected === 1;
      } else throw Error("Unauthorized");
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "Like or Unlike the event, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async toggleLike(
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
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "Star or Unstar the event, Restrictions:{ AUTHORIZED USER }",
  })
  @Authorized()
  async toggleStar(
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
      console.log(e.message);
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
      const event = await Event.findOne(eventId, {
        where: { isHidden: false },
      });
      return event;
    } catch (e) {
      console.log(e.message);
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
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("FileringCondition", { nullable: true })
    fileringConditions?: fileringConditions,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean
  ) {
    try {
      var eventList = await Event.find({
        where: { isHidden: false },
        relations: ["tags", "likedBy", "staredBy"],
        order: { createdAt: "DESC" },
      });

      const d = new Date();
      d.setHours(d.getHours() - 2); //Filter the events after the 2 hours time of completion
      if (fileringConditions) {
        if (fileringConditions.isStared) {
          eventList = eventList.filter((n) => {
            return fileringConditions.tags
              ? n.staredBy.filter((u) => u.id === user.id).length &&
                  new Date(n.time).getTime() > d.getTime() &&
                  n.tags.filter((tag) =>
                    fileringConditions.tags.includes(tag.id)
                  ).length
              : n.staredBy.filter((u) => u.id === user.id).length &&
                  new Date(n.time).getTime() > d.getTime();
          });
        } else if (fileringConditions.tags) {
          eventList = eventList.filter(
            (n) =>
              new Date(n.time).getTime() > d.getTime() &&
              n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
                .length
          );
        }
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

      const list = eventList.splice(skip, take);

      return { list, total };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => Number, {
    description: "Get Number of likes of an Event",
  })
  async likeCount(@Root() { id }: Event) {
    const event = await Event.findOne(id, { relations: ["likedBy"] });
    const likeCount = event?.likedBy.length;
    return likeCount;
  }

  @FieldResolver(() => [Tag], {
    nullable: true,
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

  @Subscription({ topics: ({ args }) => args.tag }) // here you have to give tag names
  createEventS(@Root() event: Event, @Arg("tag") tag: string): Event {
    //TODO:  we can add and check context here but not needed I think
    console.log(tag);
    return event;
  }
}

export default EventResolver;
