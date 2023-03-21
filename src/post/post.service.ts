import { Injectable } from '@nestjs/common';
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
          console.log(childrenId);
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
      // console.log(filterOptions);

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
        order: { createdAt: 'DESC' },
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
      /* const current_user = await this.userService.getOneById(user.id, [
        'permission',
      ]);
      let postList: Post[];
      if (filteringConditions.viewReportedPosts) {
        postList = await this.postRepository.find({
          where: {
            status: PostStatus.REPORTED,
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
            'likedBy',
            'createdBy',
            'savedBy',
            'tags',
            'postReports.createdBy',
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
            'likedBy',
            'createdBy',
            'savedBy',
            'tags',
            'postReports.createdBy',
          ],
          order: { createdAt: 'DESC' },
        });

        //Filter the posts after the 2 hours time of completion

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
        console.log(postList);

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
      return { list: finalList, total };*/
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async create(post: CreatePostInput, user: User) {
    var postStatus;
    const currentUser = await this.userService.getOneById(user.id, [
      'permission',
    ]);
    // if (!currentUser.permission.livePosts.includes(post.category)) {
    //   postStatus = PostStatus.TO_BE_APPROVED;
    // }
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
    let createdPost = await this.postRepository.save(newPost);
    await this.notificationService.notifyPost(createdPost);
    return createdPost;
  }

  async changeStatus(
    post: Post,
    user: User,
    status: PostStatus,
  ): Promise<Post> {
    const superUsers = await this.userService.getAncestorswithAprrovalAccess(
      user,
    );
    if (!superUsers.filter((u) => u.id === user.id).length) {
      throw new Error('Permission Denied');
    }
    post.status = status;
    post.approvedBy = user;
    return this.postRepository.save(post);
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
        'createdBy.notifConfig',
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
        if (post?.likedBy?.filter((u) => u.id === user.id)?.length) {
          post.likedBy = post?.likedBy?.filter((e) => e.id !== user.id);
          return await this.postRepository.save(post);
        } else {
          post?.likedBy?.push(user);
          let likedPost = await this.postRepository.save(post);
          if (post.likedBy.filter((u) => u.id === user.id))
            await this.notificationService.likedPost(likedPost);
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
}
