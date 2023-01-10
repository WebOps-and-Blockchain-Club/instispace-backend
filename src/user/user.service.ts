import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { LoginInput } from './type/user.input';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) { }

  async login(loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.roll,
      loginInput.pass,
    );
    if (!user) {
      throw new BadRequestException(`Email or password are invalid`);
    } else {
      return this.authService.generateToken(user);
    }
  }

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  getOneById(id: string, relations: [string]): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: id },
      relations,
    });
  }

  getOneByRoll(roll: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { roll },
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
}
