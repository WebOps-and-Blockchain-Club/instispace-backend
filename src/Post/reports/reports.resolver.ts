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
import { User } from 'src/user/user.entity';
import { Post } from '../post.entity';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { CreateReportInput } from './types/create-report.input';

@Resolver(() => Report)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

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
    let newReport = await this.reportsService.getReport(report.id, ['post']);
    return newReport.post;
  }

  @ResolveField(() => Comment)
  async comment(@Parent() report: Report) {
    let newReport = await this.reportsService.getReport(report.id, ['comment']);
    return newReport.comment;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() report: Report) {
    let newReport = await this.reportsService.getReport(report.id, [
      'createdBy',
    ]);
    return newReport.createdBy;
  }
}
