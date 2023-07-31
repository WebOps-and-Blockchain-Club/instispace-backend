import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/notification.service';
import Tag from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import {
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  Not,
  Repository,
  FindManyOptions,
  MoreThanOrEqual,
} from 'typeorm';
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
    private readonly notificationService: NotificationService,
  ) {}
  async findAll(
    lastpostId: string,
    take: number,
    filteringConditions: FilteringConditions,
    orderInput: OrderInput,
    user: User,
  ) {
    try {
      if (filteringConditions.showNewPost == null) {
        filteringConditions.showNewPost = !filteringConditions.showOldPost;
        if (
          !!filteringConditions.viewReportedPosts ||
          !!filteringConditions.posttobeApproved ||
          !!filteringConditions.createdByMe ||
          !!filteringConditions.createBy
        ) {
          filteringConditions.showNewPost = false;
        }
        if (!!filteringConditions.followedTags) {
          filteringConditions.showNewPost = true;
        }
      }
      if (filteringConditions.followedTags) {
        const current_user = await this.userService.getOneById(user.id, [
          'interests',
        ]);
        filteringConditions.tags = current_user.interests.map((e) => e.id);
      }

      let filterOptions: FindOptionsWhere<Post> | FindOptionsWhere<Post>[] = {};
      filterOptions = {
        status: In([
          PostStatus.POSTED,
          PostStatus.REPORTED,
          PostStatus.APPROVED,
          PostStatus.REPORT_REJECTED,
        ]),
        isHidden: false,
      };

      if (filteringConditions) {
        if (filteringConditions.viewReportedPosts) {
          delete filterOptions.postReports;
          filterOptions = {
            ...filterOptions,
            status: In([
              PostStatus.REPORTED,
              PostStatus.IN_REVIEW,
              PostStatus.REPORT_ACCEPTED,
              PostStatus.REPORT_REJECTED,
            ]),
          };
        }
        if (filteringConditions.posttobeApproved) {
          const childrenUser = await this.userService.getChildren(user);
          const childrenId = childrenUser.map((e) => e.id);
          filterOptions = {
            ...filterOptions,
            status: PostStatus.TO_BE_APPROVED,
            createdBy: {
              id: In(childrenId),
            },
          };
        }

        if (
          filteringConditions.categories &&
          filteringConditions.categories.length
        ) {
          filterOptions = {
            ...filterOptions,
            category: In(filteringConditions.categories),
          };
        }
        if (filteringConditions.isSaved) {
          filterOptions = {
            ...filterOptions,
            savedBy: {
              id: user.id,
            },
          };
        }
        if (filteringConditions.isLiked) {
          filterOptions = {
            ...filterOptions,
            likedBy: {
              id: user.id,
            },
          };
        }
        if (filteringConditions.createBy) {
          filterOptions = {
            ...filterOptions,
            createdBy: {
              id: filteringConditions.createBy,
            },
          };
        }
        if (filteringConditions.createdByMe) {
          filterOptions = {
            ...filterOptions,
            createdBy: {
              id: user.id,
            },
          };
        }
        if (filteringConditions.tags && filteringConditions.tags.length) {
          filterOptions = {
            ...filterOptions,
            tags: {
              id: In(filteringConditions.tags),
            },
          };
        }
        if (filteringConditions.showNewPost) {
          const currentDate = new Date();
          filterOptions = [
            { ...filterOptions, endTime: MoreThanOrEqual(currentDate) },
            { ...filterOptions, endTime: IsNull() },
          ];
        }
        if (filteringConditions.search) {
          if (Array.isArray(filterOptions)) {
            let _tmpFilterOptions: FindOptionsWhere<Post>[] = [];
            filterOptions.map(
              (e) =>
                (_tmpFilterOptions = _tmpFilterOptions.concat([
                  {
                    ...e,
                    title: ILike(`%${filteringConditions.search}%`),
                  },
                  {
                    ...e,
                    content: ILike(`%${filteringConditions.search}%`),
                  },
                ])),
            );
            filterOptions = _tmpFilterOptions;
          } else {
            filterOptions = [
              {
                ...filterOptions,
                title: ILike(`%${filteringConditions.search}%`),
              },
              {
                ...filterOptions,
                content: ILike(`%${filteringConditions.search}%`),
              },
            ];
          }
          filterOptions = [
            {
              ...filterOptions,
              title: ILike(`%${filteringConditions.search}%`),
            },
            {
              ...filterOptions,
              content: ILike(`%${filteringConditions.search}%`),
            },
          ];
        }
      }

      if (Array.isArray(filterOptions)) {
        let _tmpFilterOptions: FindOptionsWhere<Post>[] = [];
        filterOptions.map(
          (e) =>
            (_tmpFilterOptions = _tmpFilterOptions.concat([
              {
                ...e,
                postReports: {
                  id: IsNull(),
                },
              },
              {
                ...e,
                postReports: {
                  createdBy: {
                    id: Not(user.id),
                  },
                },
              },
            ])),
        );
        filterOptions = _tmpFilterOptions;
      } else {
        filterOptions = [
          {
            ...filterOptions,
            postReports: {
              id: IsNull(),
            },
          },
          {
            ...filterOptions,
            postReports: {
              createdBy: {
                id: Not(user.id),
              },
            },
          },
        ];
      }

      let findOptions: FindManyOptions<Post> = {};
      findOptions = {
        where: filterOptions,
        relations: [
          'postComments',
          'postReports',
          'postReports.createdBy',
          'likedBy',
          'createdBy',
          'savedBy',
          'tags',
        ],
        order: { createdAt: 'DESC', postComments: { createdAt: 'ASC' } },
      };

      let posts: Post[] = await this.postRepository.find(findOptions);

      if (!orderInput) {
        posts.sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0,
        );
      }

      if (orderInput) {
        if (orderInput.byLikes == true) {
          posts.sort((a, b) =>
            a.likedBy.length > b.likedBy.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0,
          );
        } else if (orderInput.byLikes == false) {
          posts.sort((a, b) =>
            a.likedBy.length < b.likedBy.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0,
          );
        }
      }

      const total = posts.length;
      let finalList;

      if (lastpostId) {
        const index = posts.map((n) => n.id).indexOf(lastpostId);
        finalList = posts.splice(index + 1, take);
      } else {
        finalList = posts.splice(0, take);
      }
      return { list: finalList, total };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async create(post: CreatePostInput, user: User) {
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
      newPost.status = postStatus;
    }
    if (post.endTime) newPost.endTime = post.endTime;
    newPost.createdBy = user;
    let createdPost = await this.postRepository.save(newPost);
    this.notificationService.notifyPost(createdPost);
    return createdPost;
  }

  async changeStatus(
    post: Post,
    user: User,
    status: PostStatus,
  ): Promise<Post> {
    post.status = status;
    if ([PostStatus.APPROVED, PostStatus.REJECTED].includes(status))
      post.approvedBy = user;
    return this.postRepository.save(post);
  }

  async findOne(id: string): Promise<Post> {
    return this.postRepository.findOne({
      where: { id: id },
      relations: [
        'users',
        'postComments',
        'postComments.createdBy',
        'postReports',
        'createdBy',
        'likedBy',
        'tags',
        'savedBy',
        'dislikedBy',
        'approvedBy',
        'createdBy.notifConfig',
      ],
    });
  }

  async findOneWithAttendees(id: string): Promise<Post> {
    return this.postRepository.findOne({
      where: { id: id },
      relations: ['eventAttendees'],
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

  async remove(post: Post, user: User) {
    let newPost = await this.findOne(post?.id);
    if (newPost.createdBy?.id === user.id) {
      newPost.isHidden = true;
      return await this.postRepository.save(newPost);
    } else {
      throw new UnauthorizedException(
        'You are not authorized to delete this post',
      );
    }
  }

  async save(post: Post) {
    return await this.postRepository.save(post);
  }

  async toggleLike(post: Post, user: User) {
    try {
      if (post) {
        if (post?.likedBy?.filter((u) => u.id === user.id)?.length) {
          post.likedBy = post?.likedBy?.filter((e) => e.id !== user.id);
          return await this.postRepository.save(post);
        } else {
          post?.likedBy?.push(user);
          let likedPost = await this.postRepository.save(post);
          if (post.likedBy.filter((u) => u.id === user.id))
            this.notificationService.likedPost(likedPost);
          return likedPost;
        }
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
  async markEventAttendance(post: Post, user: User) {
    try {
      if (post) {
        if (post.isQRActive) {
          if (post.eventAttendees == null) post.eventAttendees = [];
          if (
            post.isQRActive == true &&
            post?.eventAttendees.filter((u) => u.id === user.id)?.length == 0
          ) {
            post?.eventAttendees?.push(user);
            console.log(post.eventAttendees);
            return await this.postRepository.save(post);
          }
        } else {
          throw new Error('Post is not an event');
        }
      } else {
        throw new Error('Invalid post');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async updatePoints(post: Post, points: Number) {
    try {
      if (post) {
        if (post.isQRActive == null) {
          post.isQRActive = true;
          post.pointsValue = points;
        } else {
          //console.log('Changing activity status');
          post.pointsValue = points;
        }
        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async toggleIsQRActive(post: Post, points: Number) {
    try {
      if (post) {
        if (post.isQRActive == null) {
          post.isQRActive = true;
          post.pointsValue = points;
        } else {
          // console.log('Changing activity status');
          post.isQRActive = !post.isQRActive;
          post.pointsValue = points;
        }
        return await this.postRepository.save(post);
      } else {
        throw new Error('Invalid post');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
