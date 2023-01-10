import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Post } from "./post.entity";
import { PostService } from "./post.service";
import { CreatePostInput } from "./type/create-post.input";
import { UpdatePostInput } from "./type/update-post";

@Resolver(()=>Post)
export class PostResolver{
    constructor(private readonly postService:PostService){}

    @Query(()=> [Post],{name:"FindAllposts"})
    async findAllPost(){
       console.log(this.postService.findAll());
       
       return await this.postService.findAll();
    }

    @Mutation(()=> Post,{name:"CreatePost"})
    async create(@Args('postInput')post:CreatePostInput){
       return await this.postService.create(post);
    }

    @Query(()=> Post,{name:"Findpost"})
    async findOnePost(@Args('Postid')postId:string){
       return await this.postService.findOne(postId);
    } 
    
    @Mutation(() => Post)
 async updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput,@Args("id") id:string) {
    let postToUpdate=await this.postService.findOne(id);
    return this.postService.update(updatePostInput,postToUpdate);
  }

  @Mutation(() => Post)
  removePost(@Args('id') id: string) {
    return this.postService.remove(id);
  }
    
}