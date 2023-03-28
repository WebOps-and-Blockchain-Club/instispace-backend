import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  Query,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import Amenity from 'src/amenity/amenity.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionEnum } from 'src/auth/permission.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import HostelContact from 'src/hostelContact/hostelContact.entity';
import Hostel from './hostel.entity';
import HostelService from './hostel.service';

@Resolver(() => Hostel)
class HostelResolver {
  constructor(private readonly hostelService: HostelService) {}
  @Mutation(() => Hostel, {
    description: 'Mutation to create hostel',
  })
  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.HOSTEL))
  async createHostel(@Args('Hostel') name: string) {
    return await this.hostelService.create(name);
  }

  @Query(() => [Hostel])
  async getHostels() {
    return await this.hostelService.getAll();
  }

  @ResolveField('amenities', () => [Amenity])
  async getAmenities(@Parent() hostel: Hostel) {
    return await this.hostelService.amenities(hostel);
  }
  @ResolveField('contacts', () => [HostelContact])
  async getHostelContacts(@Parent() hostel: Hostel) {
    return await this.hostelService.contacts(hostel);
  }
}
export default HostelResolver;
