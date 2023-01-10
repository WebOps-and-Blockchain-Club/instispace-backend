import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Post } from '../post.entity';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { CreateReportInput } from './types/create-report.input';
import { UpdateReportInput } from './types/update-report.input';


@Resolver(() => Report)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Mutation(() => Report)
  createReport(@Args('createReportInput') createReportInput: CreateReportInput) {
    return this.reportsService.create(createReportInput);
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
  updateReport(@Args('updateReportInput') updateReportInput: UpdateReportInput) {
    
  }

  @Mutation(() => Report)
  removeReport(@Args('id') id: string) {
    return this.reportsService.remove(id);
  }

  @ResolveField(()=> Post)
 async post(@Parent() report:Report){
     let  newReport =await this.reportsService.getReport(report.id);
     return newReport.post;

  }

  @ResolveField(()=> Comment)
  async comment(@Parent() report:Report){
    let  newReport =await this.reportsService.getReport(report.id);
    return newReport.comment;
 
   }
}
