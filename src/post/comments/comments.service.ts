import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotifConfigService } from 'src/notif-config/notif-config.service';
import { NotificationService } from 'src/notification/notification.service';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { Comments } from './comment.entity';
import { CreateCommentInput } from './type/create-comment.input';
import { UpdateCommentInput } from './type/update-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments) private commentRepository: Repository<Comments>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    comment: CreateCommentInput,
    user: User,
    post: Post,
  ): Promise<Comments> {
    try {
      const element = new Comments();
      element.content = comment.content;
      element.post = post!;
      element.createdBy = user;
      let imageUrls;
      if (comment.photoList && comment.photoList.length) {
        imageUrls = comment.photoList.join(' AND ');
      }
      element.photo = imageUrls === '' ? null : imageUrls;

      let createdComment = await this.commentRepository.save(element);
      this.notificationService.notifyComment(post, createdComment.content);
      return createdComment;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  findAll() {
    return this.commentRepository.find({
      relations: [
        'commentReports',
        'post',
        'createBy',
        'likedBy',
        'dislikedBy',
      ],
      where: { isHidden: false },
    });
  }

  findOne(id: string, relations: string[]) {
    return this.commentRepository.findOne({
      where: { id: id },
      relations: relations,
    });
  }

  async update(
    updateCommentInput: UpdateCommentInput,
    commentToUpdate: Comments,
  ): Promise<Comments> {
    try {
      if (updateCommentInput.content)
        commentToUpdate.content = updateCommentInput.content;

      if ((commentToUpdate.isHidden = updateCommentInput.isHidden))
        commentToUpdate.isHidden = updateCommentInput.isHidden;

      let imageUrls;
      if (updateCommentInput.photoList && updateCommentInput.photoList.length) {
        imageUrls = updateCommentInput.photoList.join(' AND ');
      }
      if (imageUrls !== '') commentToUpdate.photo = imageUrls;

      return await this.commentRepository.save(commentToUpdate);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async remove(id: string) {
    let comment = await this.commentRepository.findOne({ where: { id: id } });
    comment.isHidden = true;
    return await this.commentRepository.save(comment);
  }

  async save(comment: Comments) {
    return this.commentRepository.save(comment);
  }

  async toggleLike(comment: Comments, user: User) {
    try {
      if (comment) {
        if (comment?.likedBy?.filter((u) => u.id === user.id)?.length) {
          comment.likedBy = comment?.likedBy?.filter((e) => e.id !== user.id);
          return await this.commentRepository.save(comment);
        } else {
          comment?.likedBy?.push(user);
          let likedComment = await this.commentRepository.save(comment);
          this.notificationService.likedComment(likedComment);
          return likedComment;
        }
      } else {
        throw new Error('Invalid comment id ');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async toggleDislike(comment: Comments, user: User) {
    try {
      if (comment) {
        if (comment?.dislikedBy?.filter((u) => u.id === user.id)?.length)
          comment.dislikedBy = comment?.dislikedBy?.filter(
            (e) => e.id !== user.id,
          );
        else comment?.dislikedBy?.push(user);

        return await this.commentRepository.save(comment);
      } else {
        throw new Error('Invalid comment id ');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
