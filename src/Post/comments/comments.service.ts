import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostService } from 'src/Post/post.service';
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
      return await this.commentRepository.save(element);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  findAll() {
    return this.commentRepository.find({
      relations: ['commentReports', 'post', 'createBy'],
    });
  }

  findOne(id: string) {
    return this.commentRepository.findOne({
      where: { id: id },
      relations: ['commentReports', 'post', 'createBy'],
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
      return await this.commentRepository.save(commentToUpdate);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  remove(id: string) {
    return this.commentRepository.delete(id);
  }

  async getComment(id: string, relation: [string]) {
    return this.commentRepository.findOne({
      where: { id: id },
      relations: relation,
    });
  }
}
