import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Tag from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { In, Repository } from 'typeorm';
import { PostCategory } from './type/post-category.enum';
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
    private readonly userService: UserService,
  ) {}
  async findAll(
    lastpostId: string,
    take: number,
    filteringConditions: FilteringConditions,
    orderInput: OrderInput,
    user: User,
  ) {
    try {
      const current_user = await this.userService.getOneById(user.id, [
        'permission',
      ]);
      let postList: Post[];
      if (filteringConditions.viewReportedPosts) {
        postList = await this.postRepository.find({
          where: {
            status: In([
              PostStatus.REPORTED,
              PostStatus.IN_REVIEW,
              PostStatus.REPORT_ACCEPTED,
              PostStatus.REPORT_REJECTED,
            ]),
          },
          relations: [
            'postComments',
            'postReports',
            'postReports.createdBy',
            'likedBy',
            'createdBy',
            'savedBy',
            'tags',
          ],
          order: { createdAt: 'DESC' },
        });
      } else if (filteringConditions.posttobeApproved) {
        postList = await this.postRepository.find({
          where: {
            isHidden: false,
            status: PostStatus.TO_BE_APPROVED,
          },
          relations: [
            'postComments',
            'postReports',
            'postReports.createdBy',
            'likedBy',
            'createdBy',
            'savedBy',
            'tags',
          ],
          order: { createdAt: 'DESC' },
        });
        // get posts made by descendents
        const descendentsStr = JSON.stringify(
          await this.userService.getDescendantsTree(current_user),
        );
        postList = postList.filter((post) =>
          descendentsStr.includes(post.createdBy.id),
        );
      } else {
        postList = await this.postRepository.find({
          where: {
            isHidden: false,
            status: In([
              PostStatus.POSTED,
              PostStatus.REPORTED,
              PostStatus.APPROVED,
              PostStatus.REPORT_REJECTED,
            ]),
          },
          relations: [
            'postComments',
            'postReports',
            'postReports.createdBy',
            'likedBy',
            'createdBy',
            'createdBy.interests',
            'savedBy',
            'tags',
          ],
          order: { createdAt: 'DESC' },
        });

        // Filter the posts after the 2 hours time of completion

        // default filters (endtime should not exceed)

        let filterDate = {
          [PostCategory.Review]: 7,
          [PostCategory.RandomThought]: 3,
          [PostCategory.Help]: 3,
          [PostCategory.Announcement]: 7,
          [PostCategory.Lost]: 7,
          [PostCategory.Found]: 7,
        };

        if (filteringConditions.showOldPost) {
          postList = postList.filter((n) => {
            const d = new Date();
            if (n.endTime && new Date(n.endTime).getTime() < d.getTime()) {
              return true;
            } else if (n.category === PostCategory.Query) {
              return false;
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
            const d = new Date();
            if (n.endTime && new Date(n.endTime).getTime() > d.getTime())
              return true;
            else if (n.category === PostCategory.Query) {
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
                n.tags.filter((tag) =>
                  filteringConditions.tags.includes(tag.id),
                ).length,
            );
          }

          if (filteringConditions.followedTags) {
            const current_user = await this.userService.getOneById(user.id, [
              'interests',
            ]);
            postList = postList.filter((n) => {
              n.tags.filter((tag) => current_user.interests.includes(tag))
                .length;
            });
          }

          if (
            filteringConditions.categories &&
            filteringConditions.categories.length
          ) {
            console.log(filteringConditions.categories);
            postList = postList.filter((n) =>
              filteringConditions.categories.includes(n.category),
            );
            // console.log(postList);
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
    var postStatus;
    const currentUser = await this.userService.getOneById(user.id, [
      'permission',
    ]);
    if (!currentUser.permission.livePosts.includes(post.category)) {
      postStatus = PostStatus.TO_BE_APPROVED;
    }
    var tags: Tag[] = [];

    if (post.tagIds) {
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
    }

    let imageUrls;
    if (post.photoList && post.photoList.length) {
      imageUrls = post.photoList.join(' AND ');
    }

    let newPost = new Post();
    newPost.Link = post.link;
    newPost.category = post.category;
    newPost.content = post.content;
    newPost.linkName = post.linkName;
    newPost.location = post.location;
    if (post.postTime) newPost.postTime = post.postTime;
    newPost.photo = imageUrls === '' ? null : imageUrls;
    newPost.title = post.title;
    newPost.tags = post.tags;

    if (postStatus) {
      const superUsers = await this.userService.getAncestorswithAprrovalAccess(
        user,
      );
      // send notif
      console.log(superUsers);
      newPost.status = postStatus;
    }
    if (post.endTime) newPost.endTime = post.endTime;
    newPost.createdBy = user;
    return this.postRepository.save(newPost);
  }

  async changeStatus(
    post: Post,
    user: User,
    status: PostStatus,
  ): Promise<Post> {
    if ([PostStatus.APPROVED, PostStatus.REJECTED].includes(status)) {
      const superUsers = await this.userService.getAncestorswithAprrovalAccess(
        user,
      );
      if (!superUsers.filter((u) => u.id === user.id).length) {
        throw new Error('Permission Denied');
      }
      post.status = status;
      post.approvedBy = user;
      return this.postRepository.save(post);
    } else {
      const _user = await this.userService.getOneById(user.id, ['permission']);
      if (!_user.permission.handleReports) throw new Error('Permission Denied');
      post.status = status;
      // TODO: maintain resolved by
      return this.postRepository.save(post);
    }
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
        'approvedBy',
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
    let imageUrls;
    if (updatePostInput.photoList && updatePostInput.photoList.length) {
      imageUrls = updatePostInput.photoList.join(' AND ');
    }
    postToUpdate.photo = imageUrls === '' ? null : imageUrls;
    if (updatePostInput.link) postToUpdate.Link = updatePostInput.link;
    if (updatePostInput.category)
      postToUpdate.category = updatePostInput.category;
    if (updatePostInput.content) postToUpdate.content = updatePostInput.content;
    if (updatePostInput.linkName)
      postToUpdate.linkName = updatePostInput.linkName;
    if (updatePostInput.location)
      postToUpdate.location = updatePostInput.location;
    if (updatePostInput.endTime) postToUpdate.endTime = updatePostInput.endTime;
    if (updatePostInput.postTime)
      postToUpdate.postTime = updatePostInput.postTime;
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
