import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments/comments.service';
import { PostService } from '../post.service';
import { Report } from './report.entity';
import { CreateReportInput } from './types/create-report.input';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    private commentService: CommentsService,
    private postService: PostService,
  ) {}

  async create(
    createReportInput: CreateReportInput,
    elementId: string,
    user: User,
  ) {
    try {
      const report = new Report();
      report.description = createReportInput.description;

      const comment = await this.commentService.findOne(elementId);
      report.comment = comment!;

      const post = await this.postService.findOne(elementId);
      report.post = post;

      report.createdBy = user;

      return await this.reportRepository.save(report);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  findAll() {
    return this.reportRepository.find({
      relations: ['post', 'comment', 'createdBy'],
    });
  }

  findOne(id: string) {
    return this.reportRepository.findOne({
      where: { id: id },
      relations: ['post', 'comment', 'createdBy'],
    });
  }

  remove(id: string) {
    return this.reportRepository.delete(id);
  }

  async getReport(id: string, relation: [string]) {
    return this.reportRepository.findOne({
      where: { id: id },
      relations: relation,
    });
  }
}
