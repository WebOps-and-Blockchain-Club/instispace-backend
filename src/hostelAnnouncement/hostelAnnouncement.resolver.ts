import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import HostelAnnouncement from './hostelAnnouncement.entity';
import HostelAnnouncementService from './hostelAnnouncement.service';
import { createHostelAnnounceInput } from './type/hostelAnnouncement.input';

@Resolver(() => HostelAnnouncement)
class HostelAnnouncementResolver {
  constructor(
    private readonly announcememtService: HostelAnnouncementService,
  ) {}
  @Mutation(() => HostelAnnouncement, {
    description: 'Mutation to create announcement',
  })
  async createHostelAnnouncement(
    @Args('NewHostelAnnouncement') announcement: createHostelAnnounceInput,
    @CurrentUser() user: User,
  ) {
    return await this.announcememtService.create(announcement, user);
  }
}
export default HostelAnnouncementResolver;
