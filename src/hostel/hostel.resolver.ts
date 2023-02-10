import {
  Args,
  Mutation,
  Resolver,
  Query,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import Amenity from 'src/amenity/amenity.entity';
import HostelContact from 'src/hostelContact/hostelContact.entity';
import Hostel from './hostel.entity';
import HostelService from './hostel.service';

@Resolver(() => Hostel)
class HostelResolver {
  constructor(private readonly hostelService: HostelService) {}
  @Mutation(() => Hostel, {
    description: 'Mutation to create hostel',
  })
  async createHostel(@Args('name') name: string) {
    return await this.hostelService.create(name);
  }

  @Query(() => [Hostel])
  async getHostels() {
    return await this.hostelService.getAll();
  }
  //TODO: userresolver
  // @ResolveField('users', () => [User])
  // async getUsers(@Parent() hostel: Hostel) {
  //   let { id } = hostel;
  //   return await this.hostelService.users(id);
  // }

  //TODO: announcement resolver
  // @ResolveField('announcements', () => [HostelAnnouncement])
  // async getHostelAnnouncements(@Parent() hostel: Hostel) {
  //   let { id } = hostel;
  //   return await this.hostelService.announcements(id);
  // }
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
