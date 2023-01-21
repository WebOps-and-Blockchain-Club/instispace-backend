import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportReason } from './reportReasons.entity';
import { CreateReportreasonInput } from './type/create-reportReason.input';
import { UpdateReportreasonInput } from './type/update-reportReason.input';

@Injectable()
export class ReportreasonsService {
  constructor(
    @InjectRepository(ReportReason)
    private ReasonRepository: Repository<ReportReason>,
  ) {}

  create(createReportreasonInput: CreateReportreasonInput) {
    let newPost = this.ReasonRepository.create(createReportreasonInput);
    return this.ReasonRepository.save(newPost);
  }

  findAll() {
    return this.ReasonRepository.find();
  }

  findOneWithReason(reason: string) {
    return this.ReasonRepository.findOne({ where: { reason: reason } });
  }

  async findOne(id: string) {
    return await this.ReasonRepository.findOne({ where: { id: id } });
  }

  async update(
    updateReportreasonInput: UpdateReportreasonInput,
    reasonToUpdate: ReportReason,
  ) {
    if (updateReportreasonInput.count)
      reasonToUpdate.count = updateReportreasonInput.count;
    if (updateReportreasonInput.reason)
      reasonToUpdate.reason = updateReportreasonInput.reason;
    return await this.ReasonRepository.save(reasonToUpdate);
  }

  remove(id: string) {
    return this.ReasonRepository.delete(id);
  }
}
