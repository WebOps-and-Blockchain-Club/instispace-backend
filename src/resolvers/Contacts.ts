import Contact from "../entities/Contact";
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
import HostelContact from "../entities/Contact";
import { UserRole } from "../utils";
import Hostel from "../entities/Hostel";
import MyContext from "../utils/context";
import { CreateContactInput, EditContactInput } from "../types/inputs/contact";

@Resolver(() => Contact)
class ContactResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Hostel-Contact, Restrictions : {Admins, Hostel-Secretories(who belong the hostel), HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async createHostelContact(
    @Ctx() { user }: MyContext,
    @Arg("CreateContactInput") contactInput: CreateContactInput,
    @Arg("HostelId") id: string
  ) {
    try {
      // finding the hostel
      const hostel = await Hostel.findOne({ where: { id } });
      if (!hostel) throw new Error("Invalid Hostel");

      if (
        user.hostel === hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        //creating the contact
        const contact = new HostelContact();
        contact.type = contactInput.type;
        contact.name = contactInput.name;
        contact.contact = contactInput.contact;
        contact.hostel = hostel;
        await contact.save();
        return !!contact;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Contact], {
    description:
      "Query to return contact information, Restrictions: {Admins, HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS])
  async getContact(@Arg("HostelId") hostelId?: string) {
    try {
      let contacts: Contact[] = [];
      if (hostelId) {
        const hostel = await Hostel.findOne({
          where: { id: hostelId },
          relations: ["contacts"],
        });
        contacts = hostel!.contacts;
      } else {
        contacts = await Contact.find();
      }
      return contacts;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to update Hostel-Contact, Restrictions : {Admins, Hostel-Secretories(who belong the hostel), HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async updateHostelContact(
    @Arg("ContactId") contactId: string,
    @Ctx() { user }: MyContext,
    @Arg("UpdateContactInput") contactInput: EditContactInput,
    @Arg("HostelId", { nullable: true }) hostelId?: string
  ) {
    try {
      const contact = await Contact.findOne({
        where: { id: contactId },
        relations: ["hostel"],
      });
      if (!contact) throw new Error("Invalid Contact");

      if (
        user.hostel === contact.hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        if (contactInput.type) contact.type = contactInput.type;
        if (contactInput.name) contact.name = contactInput.name;
        if (contactInput.contact) contact.contact = contactInput.contact;
        if (hostelId) {
          const hostel = await Hostel.findOne({ where: { id: hostelId } });
          if (!hostel) throw new Error("Invalid Hostel");
          contact.hostel = hostel;
        }
        const contactUpdated = await contact.save();
        return !!contactUpdated;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to delete Hostel Contact, Restrictions: {Admin, Has, hostel_secretary}",
  })
  async deleteHostelContact(
    @Arg("HostelId") id: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const hostelContact = await Contact.findOne({
        where: { id },
        relations: ["hostel"],
      });
      if (!hostelContact) throw new Error("Invalid Contact");
      if (
        user.hostel === hostelContact?.hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        const hostelContactDeleted = await hostelContact.remove();
        return !!hostelContactDeleted;
      }
      throw new Error("Unauthorised");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel)
  async hostel(@Root() { id, hostel }: Contact) {
    try {
      if (hostel) return hostel;
      const contact = await Contact.findOne({
        where: { id: id },
        relations: ["hostel"],
      });
      return contact?.hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default ContactResolver;
