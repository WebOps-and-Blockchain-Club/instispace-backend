import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current_user';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PostCategory } from 'src/post/type/post-category.enum';
import { UserRole } from '../type/role.enum';
import { User } from '../user.entity';
import Permission from './permission.entity';
import { PermissionService } from './permission.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Permission)
class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}
  @ResolveField(() => [String])
  async createPost(@CurrentUser() newUser: User) {
    try {
      if (
        newUser.role === UserRole.USER ||
        newUser.role === UserRole.MODERATOR ||
        newUser.role === UserRole.LEADS
      ) {
        return [
          PostCategory.Connect,
          PostCategory.Query,
          PostCategory.Opportunity,
          PostCategory.Review,
          PostCategory.RandomThought,
          PostCategory.Lost,
          PostCategory.Found,
          PostCategory.Opportunity,
          PostCategory.StudyResources,
        ];
      } else {
        return [
          PostCategory.Announcement,
          PostCategory.Competition,
          PostCategory.Connect,
          PostCategory.Event,
          PostCategory.Found,
          PostCategory.Help,
          PostCategory.Lost,
          PostCategory.Opportunity,
          PostCategory.Query,
          PostCategory.RandomThought,
          PostCategory.Recruitment,
          PostCategory.Review,
        ];
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
export default PermissionResolver;
