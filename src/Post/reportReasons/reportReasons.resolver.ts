import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReportReason } from './reportReasons.entity';

import { ReportreasonsService } from './reportreasons.service';
import { CreateReportreasonInput } from './type/create-reportReason.input';
import { UpdateReportreasonInput } from './type/update-reportReason.input';

@Resolver(() => ReportReason)
export class ReportreasonsResolver {
  constructor(private readonly reportreasonsService: ReportreasonsService) {}

  @Mutation(() => ReportReason)
  createReportreason(
    @Args('createReportreasonInput')
    createReportreasonInput: CreateReportreasonInput,
  ) {
    return this.reportreasonsService.create(createReportreasonInput);
  }

  @Query(() => [ReportReason], { name: 'reportreasons' })
  findAll() {
    return this.reportreasonsService.findAll();
  }

  @Query(() => ReportReason, { name: 'reportreason' })
  findOne(@Args('id') id: string) {
    return this.reportreasonsService.findOne(id);
  }

  @Mutation(() => ReportReason)
  async updateReportreason(
    @Args('updateReportreasonInput')
    updateReportreasonInput: UpdateReportreasonInput,
    @Args('id') id: string,
  ) {
    let reasonToUpdate = await this.reportreasonsService.findOne(id);
    return this.reportreasonsService.update(
      updateReportreasonInput,
      reasonToUpdate,
    );
  }

  @Mutation(() => ReportReason)
  removeReportreason(@Args('id') id: string) {
    return this.reportreasonsService.remove(id);
  }
}
