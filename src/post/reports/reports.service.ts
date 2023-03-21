import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotifConfigService } from 'src/notif-config/notif-config.service';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Comments } from '../comments/comment.entity';
import { CommentsService } from '../comments/comments.service';
import { Post } from '../post.entity';
import { PostService } from '../post.service';
import { ReportReason } from '../reportReasons/reportReasons.entity';
import { ReportreasonsService } from '../reportReasons/reportReasons.service';
import { PostStatus } from '../type/postStatus.enum';
import { Report } from './report.entity';
import { CreateReportInput } from './types/create-report.input';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    private commentService: CommentsService,
    private postService: PostService,
    private reasonService: ReportreasonsService,
    private notifService: NotificationService,
  ) {}

  async create(
    createReportInput: CreateReportInput,
    elementId: string,
    user: User,
  ) {
    try {
      const report = new Report();
      report.description = createReportInput.description;

      const comment = await this.commentService.findOne(elementId, [
        'commentReports',
        'createdBy',
      ]);
      const post = await this.postService.findOne(elementId);

      let rReason = await this.reasonService.findOneWithReason(
        createReportInput.description,
      );

      if (rReason && post) {
        post.status = [PostStatus.POSTED, PostStatus.REPORTED].includes(
          post.status,
        )
          ? post.postReports.filter(
              (r) => r.description === createReportInput.description,
            ).length +
              1 >=
            rReason.count
            ? PostStatus.IN_REVIEW
            : PostStatus.REPORTED
          : post.status;
        let reportedPost = await this.postService.save(post);

        await this.notifService.notifyReportedPost(
          reportedPost,
          report.description,
        );
      }
      if (rReason && comment) {
        comment.status = [PostStatus.POSTED, PostStatus.REPORTED].includes(
          comment.status,
        )
          ? comment.commentReports.filter(
              (r) => r.description === createReportInput.description,
            ).length +
              1 >=
            rReason.count
            ? PostStatus.IN_REVIEW
            : PostStatus.REPORTED
          : comment.status;
        let reportedComment = await this.commentService.save(comment);

        await this.notifService.notifyReportedComment(
          reportedComment,
          report.description,
        );
      }

      report.createdBy = user;
      report.post = post;
      report.comment = comment;

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
