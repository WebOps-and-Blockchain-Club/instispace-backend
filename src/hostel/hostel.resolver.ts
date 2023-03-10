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
    try {
      return await this.hostelService.create(name);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @Query(() => [Hostel])
  async getHostels() {
    try {
      return await this.hostelService.getAll();
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
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
    try {
      return await this.hostelService.amenities(hostel);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
  @ResolveField('contacts', () => [HostelContact])
  async getHostelContacts(@Parent() hostel: Hostel) {
    try {
      return await this.hostelService.contacts(hostel);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
export default HostelResolver;
