import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Tag from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { User } from 'src/user/user.entity';

import { In, Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostInput } from './type/create-post.input';
import { FilteringConditions } from './type/filtering-condition';
import { PostStatus } from './type/postStatus.enum';
import { OrderInput } from './type/sorting-conditions';
import { UpdatePostInput } from './type/update-post';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly tagService: TagService,
  ) {}
  async findAll(
    lastpostId: string,
    take: number,
    filteringConditions: FilteringConditions,
    orderInput: OrderInput,
    user: User,
  ) {
    try {
      let postList = await this.postRepository.find({
        where: {
          isHidden: false,
          status: In([
            PostStatus.POSTED,
            PostStatus.REPORTED,
            PostStatus.REPORT_REJECTED,
          ]),
        },
        relations: [
          'postComments',
          'postReports',
          'likedBy',
          'createdBy',
          'savedBy',
          'tags',
        ],
        order: { createdAt: 'ASC' },
      });

      const d = new Date();
      //Filter the posts after the 2 hours time of completion

      // default filters (endtime should not exceed)

      let filterDate = {
        Review: 7,
        'Random Thoughts': 3,
        Help: 3,
        Announcement: 7,
      };

      if (filteringConditions.showOldPost) {
        postList = postList.filter((n) => {
          if (n.endTime && new Date(n.endTime).getTime() < d.getTime()) {
            return true;
          } else if (n.category === 'Query') {
            return true;
          } else {
            d.setDate(d.getDate() - filterDate[n.category]);
            if (new Date(n.updatedAt).getTime() < d.getTime()) {
              return true;
            }
          }
          return false;
        });
      } else {
        postList = postList.filter((n) => {
          if (n.endTime && new Date(n.endTime).getTime() > d.getTime())
            return true;
          else if (n.category === 'Query') {
            return true;
          } else {
            d.setDate(d.getDate() - filterDate[n.category]);
            if (new Date(n.updatedAt).getTime() > d.getTime()) {
              return true;
            }
          }
          return false;
        });
      }

      postList = postList.filter(
        (n) =>
          n.postReports.filter((nr) => nr.createdBy.id === user.id).length ===
          0,
      );

      if (filteringConditions) {
        if (filteringConditions.search) {
          postList = postList.filter((post) =>
            JSON.stringify(post)
              .toLowerCase()
              .includes(filteringConditions.search?.toLowerCase()!),
          );
        }

        if (filteringConditions.tags && filteringConditions.tags.length) {
          postList = postList.filter(
            (n) =>
              n.tags.filter((tag) => filteringConditions.tags.includes(tag.id))
                .length,
          );
        }

        if (
          filteringConditions.categories &&
          filteringConditions.categories.length
        ) {
          postList = postList.filter((n) =>
            filteringConditions.categories.includes(n.category),
          );
        }
        if (filteringConditions.isSaved) {
          postList = postList.filter((e) => e.isSaved === true);
        }

        if (filteringConditions.isLiked) {
          postList = postList.filter((e) => e.isLiked === true);
        }
      }

      if (orderInput) {
        if (orderInput.byLikes == true) {
          postList.sort((a, b) =>
            a.likedBy.length > b.likedBy.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0,
          );
        } else if (orderInput.byLikes == false) {
          postList.sort((a, b) =>
            a.likedBy.length < b.likedBy.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0,
          );
        }
      }

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

  async create(post: CreatePostInput, user: User): Promise<Post> {
    var tags: Tag[] = [];

    await Promise.all(
      post.tagIds.map(async (id) => {
        const tag = await this.tagService.getOne(id, ['post']);
        if (tag) {
          tags = tags.concat([tag]);
        }
      }),
    );

    if (tags.length !== post.tagIds.length) throw new Error('Invalid tagIds');
    post.tags = tags;

    let newPost = new Post();
    newPost.Link = post.link;
    newPost.category = post.category;
    newPost.content = post.content;
    newPost.isHidden = post.isHidden;
    newPost.photo = post.Photo;
    newPost.linkName = post.linkName;
    newPost.location = post.location;
    newPost.title = post.title;
    newPost.tags = post.tags;
    if (newPost.endTime) newPost.endTime = post.endTime;

    newPost.createdBy = user;
    console.log(user);
    // if(newPost.category==='help' || newPost.category==='review')
    // {
    //   let time= newPost.createdAt;
    //   time.setDate(newPost.createdAt.getDate()+7);
    //   newPost.time=time;
    // }
    // if(newPost.category==='random thoughts')
    // {
    //   let time= newPost.createdAt;
    //   time.setDate(newPost.createdAt.getDate()+5);
    //   newPost.time=time;
    // }
    return this.postRepository.save(newPost);
  }

  async findOne(id: string): Promise<Post> {
    return this.postRepository.findOne({
      where: { id: id },
      relations: [
        'postComments',
        'postReports',
        'createdBy',
        'likedBy',
        'tags',
        'savedBy',
        'dislikedBy',
      ],
    });
  }

  async update(
    updatePostInput: UpdatePostInput,
    postToUpdate: Post,
  ): Promise<Post> {
    var tags: Tag[] = [];

    if (updatePostInput.tagIds) {
      await Promise.all(
        updatePostInput.tagIds.map(async (id) => {
          const tag = await this.tagService.getOne(id, ['post']);
          if (tag) {
            tags = tags.concat([tag]);
          }
        }),
      );

      if (tags.length !== updatePostInput.tagIds.length)
        throw new Error('Invalid tagIds');
      postToUpdate.tags = tags;
    }

    if (updatePostInput.link) postToUpdate.Link = updatePostInput.link;
    if (updatePostInput.Photo) postToUpdate.photo = updatePostInput.Photo;
    if (updatePostInput.category)
      postToUpdate.category = updatePostInput.category;
    if (updatePostInput.content) postToUpdate.content = updatePostInput.content;
    if (updatePostInput.isHidden)
      postToUpdate.isHidden = updatePostInput.isHidden;
    if (updatePostInput.linkName)
      postToUpdate.linkName = updatePostInput.linkName;
    if (updatePostInput.location)
      postToUpdate.location = updatePostInput.location;
    if (updatePostInput.title) postToUpdate.title = updatePostInput.title;
    return this.postRepository.save(postToUpdate);
  }

  async remove(post: Post) {
    post.isHidden = true;
    return await this.postRepository.save(post);
  }

  async save(post: Post) {
    return await this.postRepository.save(post);
  }

  async toggleLike(post: Post, user: User) {
    try {
      if (post) {
        if (post?.likedBy?.filter((u) => u.id === user.id)?.length)
          post.likedBy = post?.likedBy?.filter((e) => e.id !== user.id);
        else post?.likedBy?.push(user);

        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post ');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async toggleDislike(post: Post, user: User) {
    try {
      if (post) {
        if (post?.dislikedBy?.filter((u) => u.id === user.id)?.length)
          post.dislikedBy = post?.dislikedBy?.filter((e) => e.id !== user.id);
        else post?.dislikedBy?.push(user);

        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post ');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async toggleSave(post: Post, user: User) {
    try {
      if (post) {
        if (post?.savedBy?.filter((u) => u.id === user.id)?.length)
          post.savedBy = post?.savedBy?.filter((e) => e.id !== user.id);
        else post?.savedBy?.push(user);

        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
