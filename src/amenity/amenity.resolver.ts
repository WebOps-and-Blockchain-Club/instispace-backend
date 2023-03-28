import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionEnum } from 'src/auth/permission.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import Amenity from './amenity.entity';
import AmenityService from './amenity.service';
import { CreateAmenityInput } from './type/amenity.input';

@Resolver(() => Amenity)
class AmenityResolver {
  constructor(private readonly amenityService: AmenityService) {}
  @Mutation(() => Amenity, {
    description: 'Mutation to create amenity',
  })
  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.HOSTEL))
  async createAmenity(
    @Args('Amenity') amenity: CreateAmenityInput,
    @Args('HostelId') hostelId: string,
  ) {
    return await this.amenityService.create(amenity, hostelId);
  }
}
export default AmenityResolver;
