import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { LoginInput } from './type/user.input';
import { User } from './user.entity';
import { PermissionService } from './permission/permission.service';
import { PermissionInput } from './permission/type/permission.input';
import { UserRole } from './type/role.enum';
import * as bcrypt from 'bcryptjs';
import { UpdateUserInput } from './type/user.update';
import Tag from 'src/tag/tag.entity';
import { TagService } from 'src/tag/tag.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: TreeRepository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => PermissionService))
    private permissionService: PermissionService,
    @Inject(forwardRef(() => TagService))
    private tagService: TagService,
  ) {}

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

  getOneById(id: string, relations?: [string]): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: id },
      relations,
    });
  }

  async updateUser(userToUpdate: User, userInput: UpdateUserInput) {
    if (userToUpdate.name) userToUpdate.name = userInput.name;
    if (userToUpdate.mobile)
      userToUpdate.mobile = userToUpdate.password = userInput.mobile;
    if (userInput.interests.length) {
      let interests: Tag[] = [];
      await Promise.all(
        userInput.interests.map(async (interestId) => {
          interests.push(await this.tagService.getOne(interestId));
        }),
      );
      userToUpdate.interests = interests;
    }
    userToUpdate.isNewUser = false;
    return await this.usersRepository.save(userToUpdate);
  }

  getOneByRoll(roll: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { roll },
    });
  }

  getParent(child: User): Promise<User> {
    return this.usersRepository.findAncestors(child)[0];
  }

  getChildren(parent: User): Promise<User[]> {
    return this.usersRepository.findDescendants(parent);
  }

  async create(
    currentUser: User,
    roll: string,
    permissionInput: PermissionInput,
    role: UserRole,
    name?: string,
    password?: string,
    ldapName?: string,
  ): Promise<User> {
    let user = this.usersRepository.create();
    user.roll = roll;
    user.name = name;
    user.ldapName = ldapName;
    user.role = role;
    if (!!password) {
      user.password = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
      );
    }
    // const current_user = await this.usersRepository.findOne({
    //   where: { id: currentUser.id },
    //   relations: ['permission'],
    // });
    // if (current_user.permission.account.includes(role) === false)
    //   throw new Error('Permission Denied');
    let permission = await this.permissionService.getOne(permissionInput);
    if (!permission)
      permission = await this.permissionService.create(permissionInput);
    user.permission = permission;
    user.createdBy = currentUser;
    return this.usersRepository.save(user);
  }
}
