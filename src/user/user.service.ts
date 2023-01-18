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
import bcrypt from 'bcryptjs';
import { PermissionService } from './permission/permission.service';
import { PermissionInput } from './permission/type/permission.input';
import { UserRole } from './type/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: TreeRepository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => PermissionService))
    private permissionService: PermissionService,
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
    ldapName?: string,
    password?: string,
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
    return this.usersRepository.save(user);
  }
}
