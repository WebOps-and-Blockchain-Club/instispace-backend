import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "./post.entity";
import { CreatePostInput } from "./type/create-post.input";
import { UpdatePostInput } from "./type/update-post";

@Injectable()
export class PostService{

    constructor(@InjectRepository(Post) private postRepository:Repository<Post>){

    }
     findAll():Promise<Post[]>{
       return this.postRepository.find({relations:["postComments","postReports"]});
     }

     async create(post:CreatePostInput):Promise<Post>{
      let newPost= this.postRepository.create(post);
      return this.postRepository.save(newPost);
     }

    async findOne(id:string):Promise<Post>
     {
       return this.postRepository.findOne({where:{id:id},relations:["postComments","postReports"]});
     }

     async update(updatePostInput: UpdatePostInput,postToUpdate:Post) {
      postToUpdate.Link=updatePostInput.link;
      postToUpdate.photo=updatePostInput.Photo;
      postToUpdate.category=updatePostInput.category;
      postToUpdate.content=updatePostInput.content;
      postToUpdate.isHidden=updatePostInput.isHidden;
      postToUpdate.linkName=updatePostInput.linkName;
      postToUpdate.location=updatePostInput.location;
      postToUpdate.title=updatePostInput.title;
      return this.postRepository.save(postToUpdate);

     }

     remove(id: string) {
      return this.postRepository.delete(id);
    }

}