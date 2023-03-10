import { Injectable } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  getAll(): Promise<Tag[]> {
    try {
      return this.tagRepository.find();
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getOne(id: string, relations?: [string]): Promise<Tag> {
    try {
      return this.tagRepository.findOne({ where: { id }, relations });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  create(title: string, category: string): Promise<Tag> {
    try {
      const tag = this.tagRepository.create({
        title: title,
        category: category,
      });
      return this.tagRepository.save(tag);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
