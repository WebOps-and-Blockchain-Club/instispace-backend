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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: TreeRepository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private readonly permissionService: PermissionService,
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

  getOneByRoll(roll: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { roll },
    });
  }

  async getParents(child: User): Promise<User[]> {
    const parents = await this.usersRepository.findAncestors(child, {
      relations: ['permission'],
    });
    return parents;
  }

  async getAncestorswithAprrovalAccess(child: User): Promise<User[]> {
    let parents = await this.getParents(child);
    parents = parents.filter((p) => p.permission.approvePosts === true);
    return parents;
  }

  getDescendantsTree(parent: User) {
    return this.usersRepository.findDescendantsTree(parent);
  }

  getChildren(parent: User): Promise<User[]> {
    return this.usersRepository.findDescendants(parent, {
      relations: ['permission'],
    });
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
    const current_user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
      relations: ['permission'],
    });
    if (current_user.permission.account.includes(role) === false)
      throw new Error('Permission Denied');
    let permission = await this.permissionService.getOne(permissionInput);
    if (!permission)
      permission = await this.permissionService.create(permissionInput);
    user.permission = permission;
    user.createdBy = currentUser;
    console.log(user.createdBy);
    return this.usersRepository.save(user);
  }
}
