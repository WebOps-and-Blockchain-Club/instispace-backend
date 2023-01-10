import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { threadId } from 'worker_threads';
import { CommentsService } from '../comments/comments.service';
import { PostService } from '../post.service';
import { Report } from './report.entity';
import { CreateReportInput } from './types/create-report.input';
import { UpdateReportInput } from './types/update-report.input';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    private postService: PostService,
    private commentService: CommentsService,
  ) {}

  async create(createReportInput: CreateReportInput) {
    try {
      const element = new Report();
      element.description = createReportInput.description;

      const post = await this.postService.findOne(createReportInput.id);
      element.post = post!;

      const comment = await this.commentService.findOne(createReportInput.id);
      element.comment = comment!;

      return await this.reportRepository.save(element);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  findAll() {
    return this.reportRepository.find();
  }

  findOne(id: string) {
    return this.reportRepository.findOne({ where: { id: id } });
  }

  async update(updateReportInput: UpdateReportInput) {
    try {
      const element = await this.reportRepository.findOne({
        where: { id: updateReportInput.id },
      });
      element.description = updateReportInput.description;

      const post = await this.postService.findOne(updateReportInput.id);
      element.post = post!;

      const comment = await this.commentService.findOne(updateReportInput.id);
      element.comment = comment!;

      return await this.reportRepository.save(element);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  remove(id: string) {
    return this.reportRepository.delete(id);
  }

  async getReport(id: string) {
    return this.reportRepository.findOne({
      where: { id: id },
      relations: ['post', 'comment'],
    });
  }
}
