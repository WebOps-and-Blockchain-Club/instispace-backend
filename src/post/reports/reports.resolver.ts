import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current_user';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { Post } from '../post.entity';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { CreateReportInput } from './types/create-report.input';

@Resolver(() => Report)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Report)
  async createReport(
    @Args('createReportInput') createReportInput: CreateReportInput,
    @Args('postId') elementId: string,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.create(createReportInput, elementId, user);
  }

  @Query(() => [Report], { name: 'reports' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Query(() => Report, { name: 'getReport' })
  findOne(@Args('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Mutation(() => Report)
  removeReport(@Args('id') id: string) {
    return this.reportsService.remove(id);
  }

  @ResolveField(() => Post)
  async post(@Parent() report: Report) {
    try {
      let newReport = await this.reportsService.getReport(report.id, ['post']);
      return newReport.post;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => Comment)
  async comment(@Parent() report: Report) {
    try {
      let newReport = await this.reportsService.getReport(report.id, [
        'comment',
      ]);
      return newReport.comment;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  @ResolveField(() => User)
  async createdBy(@Parent() report: Report) {
    try {
      let newReport = await this.reportsService.getReport(report.id, [
        'createdBy',
      ]);
      return newReport.createdBy;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
