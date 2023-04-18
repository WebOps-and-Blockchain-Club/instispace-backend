import { UseGuards } from '@nestjs/common/decorators';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionEnum } from 'src/auth/permission.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import HostelContact from './hostelContact.entity';
import ContactService from './hostelContact.service';
import { CreateContactInput } from './type/hostelContact.input';

@Resolver(() => HostelContact)
class ContactResolver {
  constructor(private readonly contactService: ContactService) {}
  @Mutation(() => HostelContact, {
    description: 'Mutation to create contact',
  })
  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.HOSTEL))
  async createContact(
    @Args('Contact') contact: CreateContactInput,
    @Args('HostelId') hostelId: string,
  ) {
    return await this.contactService.create(contact, hostelId);
  }
}
export default ContactResolver;
