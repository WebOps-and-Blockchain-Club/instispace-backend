import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionEnum } from 'src/auth/permission.enum';
import { PermissionGuard } from 'src/auth/permission.guard';
import { Post } from 'src/post/post.entity';
import { User } from '../user/user.entity';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';
import { CreateTagInput } from './types/tag.input';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Query(() => [Tag])
  async getTags() {
    try {
      return await this.tagService.getAll();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => Tag)
  async getTag(@Args('TagId') tagId: string) {
    try {
      return await this.tagService.getOne(tagId, null);
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => Tag)
  async getTagByName(@Args('name') name: string) {
    try {
      return await this.tagService.getOneByName(name, null);
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [String])
  async getCategories() {
    const categories = [
      'Sports',
      'Cultural',
      'Academics',
      'Technical',
      'IITM Students’ Government',
    ];
    return categories;
  }

  @Mutation(() => Tag)
  @UseGuards(JwtAuthGuard, new PermissionGuard(PermissionEnum.CREATE_TAG))
  async createTag(@Args('CreateTagInput') createTagInput: CreateTagInput) {
    try {
      return await this.tagService.create(
        createTagInput.title,
        createTagInput.category,
      );
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @ResolveField(() => [User])
  async users(@Parent() { id, users }: Tag) {
    try {
      if (users) return users;
      const tag = await this.tagService.getOne(id, ['users']);
      return tag?.users;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @ResolveField(() => [Post])
  async post(@Parent() tag: Tag) {
    const tags = await this.tagService.getOne(tag.id, ['post']);
    return tag.post;
  }
}
