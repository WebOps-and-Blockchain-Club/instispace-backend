import { Args, Mutation, Resolver } from '@nestjs/graphql';
import Amenity from './amenity.entity';
import AmenityService from './amenity.service';
import { CreateAmenityInput } from './type/amenity.input';

@Resolver(() => Amenity)
class AmenityResolver {
  constructor(private readonly amenityService: AmenityService) {}
  @Mutation(() => Amenity, {
    description: 'Mutation to create amenity',
  })
  async createAmenity(
    @Args('NewAmenity') amenity: CreateAmenityInput,
    @Args('HostelId') hostelId: string,
  ) {
    return await this.amenityService.create(amenity, hostelId);
  }
}
export default AmenityResolver;
