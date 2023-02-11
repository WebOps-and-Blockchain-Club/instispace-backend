import { Args, Mutation, Resolver } from '@nestjs/graphql';
import HostelContact from './hostelContact.entity';
import ContactService from './hostelContact.service';
import { CreateContactInput } from './type/hostelContact.input';

@Resolver(() => HostelContact)
class ContactResolver {
  constructor(private readonly contactService: ContactService) {}
  @Mutation(() => HostelContact, {
    description: 'Mutation to create contact',
  })
  async createContact(
    @Args('NewContact') contact: CreateContactInput,
    @Args('HostelId') hostelId: string,
  ) {
    return await this.contactService.create(contact, hostelId);
  }
}
export default ContactResolver;
