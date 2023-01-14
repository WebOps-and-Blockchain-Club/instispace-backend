import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostInput } from './type/create-post.input';
import { FilteringConditions } from './type/filtering-condition';
import { UpdatePostInput } from './type/update-post';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly userService: UserService,
  ) {}
  async findAll(lastpostId: string, take: number,filteringConditions:FilteringConditions) {

    
    try {
      let postList = await this.postRepository.find({
        relations: ['postComments', 'postReports','likedBy','createdBy'],
      });
      const total = postList.length;
      var finalList;

      if (lastpostId) {
        const index = postList.map((n) => n.id).indexOf(lastpostId);
        finalList = postList.splice(index + 1, take);
      } else {
        finalList = postList.splice(0, take);
      }
      return { list: finalList, total };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async create(post: CreatePostInput): Promise<Post> {
    let newPost = new Post();
    newPost.Link = post.link;
    newPost.category = post.category;
    newPost.content = post.content;
    newPost.isHidden = post.isHidden;
    newPost.photo = post.Photo;
    newPost.linkName = post.linkName;
    newPost.location = post.location;
    newPost.title = post.title;
    const createByUser = await this.userService.getOneById(post.createdByUser, [
      'interests',
    ]);
    newPost.createdBy = createByUser;
    return this.postRepository.save(newPost);
  }

  async findOne(id: string): Promise<Post> {
    return this.postRepository.findOne({
      where: { id: id },
      relations: ['postComments', 'postReports','createdBy','likedBy'],
    });
  }

  async update(updatePostInput: UpdatePostInput, postToUpdate: Post) {
    postToUpdate.Link = updatePostInput.link;
    postToUpdate.photo = updatePostInput.Photo;
    postToUpdate.category = updatePostInput.category;
    postToUpdate.content = updatePostInput.content;
    postToUpdate.isHidden = updatePostInput.isHidden;
    postToUpdate.linkName = updatePostInput.linkName;
    postToUpdate.location = updatePostInput.location;
    postToUpdate.title = updatePostInput.title;
    return this.postRepository.save(postToUpdate);
  }

  remove(id: string) {
    return this.postRepository.delete(id);
  }

  async getPost(id: string) {
    return this.postRepository.findOne({
      where: { id: id },
      relations: ['createdBy','likedBy'],
    });
  }

  async toggleLike(post: Post, user: User) {
    try {
      if (post) {
        if (post?.likedBy?.filter((u) => u.id === user.id)?.length)
          post.likedBy = post?.likedBy?.filter((e) => e.id !== user.id);
        else post?.likedBy?.push(user);
        
        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post id');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
