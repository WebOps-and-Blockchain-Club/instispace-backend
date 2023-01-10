import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostService } from 'src/Post/post.service';
import { Repository } from 'typeorm';
import { Comments } from './comment.entity';
import { CreateCommentInput } from './type/create-comment.input';
import { UpdateCommentInput } from './type/update-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comments) private commentRepository: Repository<Comments>,
    private postService: PostService,
  ) {}

  async create(comment: CreateCommentInput): Promise<Comments> {
    try {
      const element = new Comments();
      element.content = comment.content;
      const post = await this.postService.findOne(comment.postId);
      element.post = post!;
      return await this.commentRepository.save(element);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  findAll() {
    return this.commentRepository.find({ relations: ['commentReports'] });
  }

  findOne(id: string) {
    return this.commentRepository.findOne({
      where: { id: id },
      relations: ['commentReports'],
    });
  }

  async update(updateCommentInput: UpdateCommentInput ,commentToUpdate:Comments): Promise<Comments> {
    try {
      commentToUpdate.content=updateCommentInput.content;
      commentToUpdate.isHidden=updateCommentInput.isHidden;
     return await this.commentRepository.save(commentToUpdate);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  remove(id: string) {
    return this.commentRepository.delete(id);
  }

  async getComment(id: string) {
    return this.commentRepository.findOne({
      where: { id: id },
      relations: ['post'],
    });
  }
}
