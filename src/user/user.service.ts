import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  getOne(id: string, relations: [string]): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: id },
      relations,
    });
  }

  create(
    roll: string,
    name?: string,
    ldapName?: string,
    password?: string,
  ): Promise<User> {
    let user = this.usersRepository.create();
    user.roll = roll;
    user.name = name;
    user.ldapName = ldapName;
    if (!!password) {
      // TODO: Hash the password
      user.password = '';
    }
    return this.usersRepository.save(user);
  }

  async validate(roll: string) {
    let user = await this.usersRepository.findOne({ where: { roll } });
    // TODO: Check the password
    const isPasswordCorrect = true;
    if (isPasswordCorrect) {
      return user;
    }
    return null;
  }
}
