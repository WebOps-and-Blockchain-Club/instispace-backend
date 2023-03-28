import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PostStatus } from 'src/post/type/postStatus.enum';
import { PermissionEnum } from './permission.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private requiredPermission: PermissionEnum) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    if (this.requiredPermission === PermissionEnum.CREATE_POST)
      if (user.permissions.livePost) return true;
    if (this.requiredPermission === PermissionEnum.HOSTEL)
      if (ctx.getArgs().Hostel)
        return user.permissions.hostel?.includes('Hostel');
      else if (ctx.getArgs().Amenity)
        return user.permissions.hostel?.includes('Amenity');
      else if (ctx.getArgs().Contact)
        return user.permissions.hostel?.includes('Contact');
    if (this.requiredPermission === PermissionEnum.CREATE_ACCOUNT)
      if (user.permissions?.account?.includes(ctx.getArgs().user.role))
        return true;
    if (this.requiredPermission === PermissionEnum.CREATE_TAG)
      return user.persmission.createTag;
    if (this.requiredPermission === PermissionEnum.CREATE_NOTIFICATION)
      return user.persmission.createNotification;
    if (this.requiredPermission === PermissionEnum.CHANGE_STATUS)
      if (
        [PostStatus.APPROVED, PostStatus.REJECTED].includes(
          ctx.getArgs().status,
        )
      )
        return user.permission.approvePosts;
      else return user.permission.handleReports;
    return false;
  }
}
