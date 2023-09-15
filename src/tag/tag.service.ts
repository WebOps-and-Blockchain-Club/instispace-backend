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
    return this.tagRepository.find();
  }

  getOne(id: string, relations?: [string]): Promise<Tag> {
    return this.tagRepository.findOne({ where: { id }, relations });
  }

  getOneByName(name: string, relations?: [string]): Promise<Tag> {
    return this.tagRepository.findOne({ where: { title: name }, relations });
  }

  create(title: string, category: string): Promise<Tag> {
    const tag = this.tagRepository.create({ title: title, category: category });
    return this.tagRepository.save(tag);
  }
}
