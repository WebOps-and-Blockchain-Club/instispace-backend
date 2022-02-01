import Complaint from "../entities/Complaint";
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
import {
  ComplaintInput,
  DeleteComplaintInput,
  EditComplaintInput,
} from "../types/inputs/complaint";
import MyContext from "../utils/context";
import { GraphQLUpload, Upload } from "graphql-upload";
import addAttachments from "../utils/uploads";
import { ComplaintCategory, UserRole } from "../utils";
import User from "../entities/User";

@Resolver((_type) => Complaint)
class ComplaintResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to add Complaint, Restrictions : {anyone who is Authorised}",
  })
  @Authorized()
  async createComplaint(
    @Arg("CreateComplaintInput") complaintInput: ComplaintInput,
    @Ctx() { user }: MyContext,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      //creating a complaint
      const complaint = new Complaint();
      complaint.title = complaintInput.title;
      complaint.description = complaintInput.description;
      complaint.location = complaintInput.location;
      complaint.user = user;

      //image upload
      if (images) {
        complaintInput.images = (await addAttachments(images, true)).join(
          " AND "
        );
        complaint.images = complaintInput.images;
      }

      complaint.category = complaintInput.category;

      complaint.save();
      return !!complaint;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to edit Complaint, Restrictions : {anyone who is Authorised}",
  })
  @Authorized()
  async editComplaint(
    @Arg("EditComplaintInput") complaintInput: EditComplaintInput,
    @Arg("ComplaintId") complaintId: string,
    @Ctx() { user }: MyContext,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      //finding the complaint and checking for the author
      const complaint = await Complaint.findOne({
        where: { id: complaintId },
        relations: ["user"],
      });
      if (complaint?.user.id !== user.id) throw new Error("Invalid User");

      //image upload
      if (images) {
        complaintInput.images = (await addAttachments(images, true)).join(
          " AND "
        );
      }

      //updating the complaint
      const { affected } = await Complaint.update(complaintId, {
        ...complaintInput,
      });
      return affected === 1;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "upvote a complaint or remove upvote if previously upvoted, Restrictions : {any authorized user}",
  })
  @Authorized()
  async toggleupvotes(
    @Arg("complaintId") complaintId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const complaint = await Complaint.findOne(complaintId, {
        relations: ["upvotedBy"],
      });
      if (complaint) {
        if (complaint.upvotedBy.filter((u) => u.id === user.id).length) {
          complaint.upvotedBy = complaint.upvotedBy.filter(
            (e) => e.id !== user.id
          );
          await complaint.save();
        } else {
          complaint.upvotedBy.push(user);
          await complaint.save();
        }
        return !!complaint;
      } else {
        throw new Error("Invalid complaint id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => [Complaint], {
    description:
      "get a list of Complaints sorted by date, ordered by upvotes if true, and order by isResolved(upresolved at the top)",
  })
  @Authorized()
  async getComplaints(
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("OrderByUpvotes", () => Boolean, { nullable: true })
    orderByUpvotes?: Boolean,
    @Arg("OrderByIsResolved", () => Boolean, { nullable: true })
    orderByIsResolved?: Boolean
  ) {
    try {
      var complaints = await Complaint.find({
        relations: ["upvotedBy"],
      });

      if (orderByUpvotes) {
        complaints.sort((a, b) =>
          a.upvotedBy.length > b.upvotedBy.length
            ? -1
            : a.upvotedBy.length < b.upvotedBy.length
            ? 1
            : 0
        );
      }

      if (orderByIsResolved) {
        complaints.sort((a, b) =>
          a.isResolved === true && b.isResolved === (false || true)
            ? -1
            : a.isResolved === false && b.isResolved === true
            ? 1
            : 0
        );
      }

      complaints.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );

      return complaints.splice(skip, take);
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to resolve a complaint, resolver should add proofs of resolution, Restrictions : {Hostel_Secretory, HAS and Secretories}",
  })
  @Authorized([UserRole.HAS, UserRole.HOSTEL_SEC, UserRole.SECRETORY])
  async deleteComplaint(
    @Arg("DeleteComplaintInput") complaintInput: DeleteComplaintInput,
    @Arg("ComplaintId") complaintId: string,
    @Ctx() { user }: MyContext,
    @Arg("ProofImages", () => [GraphQLUpload], { nullable: true })
    images?: Upload[]
  ) {
    try {
      const complaint = await Complaint.findOne({
        where: { id: complaintId },
      });
      if (
        (complaint?.category === ComplaintCategory.HOSTEL_COMPLAINTS &&
          user.role === UserRole.HOSTEL_SEC) ||
        (complaint?.category === ComplaintCategory.GENERAL_COMPLAINTS &&
          user.role === UserRole.SECRETORY) ||
        user.role === UserRole.HAS
      ) {
        if (images) {
          complaintInput.resolutionImg = (
            await addAttachments(images, true)
          ).join(" AND ");
        }
        const { affected } = await Complaint.update(complaintId, {
          ...complaintInput,
        });
        return affected === 1;
      }
      throw new Error("Unauthorised");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Number, { description: "getting number of upvotes" })
  async upvotes(@Root() { id, upvotedBy}: Complaint) {
    try {
      if(upvotedBy) return upvotedBy.length;
      const complaint = await Complaint.findOne(id, {
        relations: ["upvotedBy"],
      });
      const upvotes = complaint?.upvotedBy.length;
      if (upvotes === null) return 0;
      return upvotes;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User)
  async user(@Root() { id, user }: Complaint) {
    try {
      if (user) return user;
      const complaint = await Complaint.findOne({
        where: { id: id },
        relations: ["user"],
      });
      return complaint?.user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [User])
  async upvotedBy(@Root() { id, upvotedBy }: Complaint) {
    try {
      if (upvotedBy) return upvotedBy;
      const complaint = await Complaint.findOne({
        where: { id: id },
        relations: ["upvotedBy"],
      });
      return complaint?.upvotedBy;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default ComplaintResolver;
