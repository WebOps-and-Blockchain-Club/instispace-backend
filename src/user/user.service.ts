import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, TreeRepository } from 'typeorm';
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
import Hostel from 'src/hostel/hostel.entity';
import { Repository } from 'typeorm';
import { autoGenPass, Notification } from 'src/utils';
import { In } from 'typeorm';
import { emailExpresion } from 'src/utils/index';
import {
  adminEmail,
  adminPassword,
  accountPassword,
  usersDevList,
} from 'src/utils/config.json';
import UsersDev from './usersDev.entity';
import { LdapService } from 'src/ldap/ldap.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: TreeRepository<User>,
    @InjectRepository(UsersDev)
    private usersDevRepository: Repository<UsersDev>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => PermissionService))
    private permissionService: PermissionService,
    @Inject(forwardRef(() => TagService))
    private tagService: TagService,
    @Inject(LdapService)
    private ldapService: LdapService,
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
  ) {}

  async login({ roll, pass }: LoginInput) {
    if (emailExpresion.test(roll) === false) {
      let ldapUser: any;
      if (process.env.NODE_ENV === 'development') {
        // If user development database is empty add few random users in database
        const usersDevCount = await this.usersDevRepository.count();
        if (usersDevCount === 0) {
          await Promise.all(
            usersDevList.map(async (_user) => {
              const userDev = this.usersDevRepository.create({ ..._user });
              await this.usersDevRepository.save(userDev);
            }),
          );
        }

        // Check the user credentials in development database
        ldapUser = await this.usersDevRepository.findOne({
          where: { roll: roll.toLowerCase(), pass: pass },
        });
        if (!ldapUser) throw new Error('Invalid Credentials');
      } else {
        // Check with LDAP
        ldapUser = await this.ldapService.auth(roll, pass);
        if (!ldapUser) throw new Error('Invalid Credentials');
      }

      /************ Check the user details ************/
      const user = await this.usersRepository.findOne({
        where: { roll: roll.toLowerCase() },
      });
      // If user doesn't exists
      if (!user) {
        const newUser = this.usersRepository.create();
        newUser.roll = roll.toLowerCase();
        newUser.role = UserRole.USER;
        newUser.ldapName = ldapUser.displayName;
        newUser.isNewUser = true;
        // TODO: notification
        await this.usersRepository.save(newUser);
        const token = (await this.authService.generateToken(newUser))
          .accessToken;
        return { isNewUser: newUser.isNewUser, role: UserRole.USER, token };
      }
      // If user exists
      else {
        // TODO: notification
        const token = (await this.authService.generateToken(user)).accessToken;
        return {
          isNewUser: user.isNewUser,
          role: user.role,
          token,
        };
      }
    }
    // For superusers
    else {
      if (process.env.NODE_ENV === 'development') {
        const admins = await this.usersRepository.find({
          where: { role: UserRole.ADMIN },
        });

        if (admins.length === 0) {
          const admin = this.usersRepository.create();
          admin.roll = adminEmail.toLowerCase();
          admin.role = UserRole.ADMIN;
          admin.isNewUser = false;
          // TODO: notification
          admin.password = bcrypt.hashSync(
            adminPassword,
            bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
          );
          await this.usersRepository.save(admin);
        }
      }
      const user = await this.authService.validateUser(roll, pass);
      if (!user) throw new BadRequestException(`Email or password are invalid`);
      else {
        const token = (await this.authService.generateToken(user)).accessToken;
        // TODO: notification
        return {
          isNewUser: user.isNewUser,
          role: user.role,
          token,
        };
      }
    }
  }

  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUsers(lastUserId: string, take: number, search?: string) {
    try {
      let usersList: User[] = [];
      if (search) {
        await Promise.all(
          ['roll', 'name', 'ldapName'].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
            const userF = await this.usersRepository.find({ where: filter });
            userF.forEach((user) => {
              usersList.push(user);
            });
          }),
        );

        const userStr = usersList.map((obj) => JSON.stringify(obj));
        const uniqueUserStr = new Set(userStr);
        usersList = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
      } else {
        usersList = await this.usersRepository.find({
          where: { role: In([UserRole.USER, UserRole.MODERATOR]) },
        });
      }
      const total = usersList.length;
      var finalList;
      if (lastUserId) {
        const index = usersList.map((n) => n.id).indexOf(lastUserId);
        finalList = usersList.splice(index + 1, take);
      } else {
        finalList = usersList.splice(0, take);
      }
      console.log(finalList);
      return { list: finalList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  getOneById(id: string, relations?: [string]): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: id },
      relations,
    });
  }

  async updateUser(
    userToUpdate: User,
    userInput: UpdateUserInput,
  ): Promise<User> {
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
    return this.usersRepository.save(userToUpdate);
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
    ldapName?: string,
  ): Promise<User> {
    let user = this.usersRepository.create();
    user.roll = roll;
    user.ldapName = ldapName;
    user.role = role;
    let password =
      process.env.NODE_ENV === 'development' ? accountPassword : autoGenPass(8);
    // TODO: mail this password
    user.password = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
    );
    console.log(password);

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

  async validate(roll: string) {
    let user = await this.usersRepository.findOne({ where: { roll } });
    // TODO: Check the password
    const isPasswordCorrect = true;
    if (isPasswordCorrect) {
      return user;
    }
    return null;
  }

  async hostel(name: string, user: User) {
    let hostel = await this.hostelRepository.findOne({ where: { name } });
    let currUser = await this.usersRepository.findOne({
      where: { id: user.id },
    });
    currUser.hostel = hostel;
    this.usersRepository.save(currUser);
    return hostel;
  }

  async usersForNotif() {
    return await this.usersRepository.find({
      where: {
        isNewUser: false,
        notifyPost: In([Notification.FOLLOWED_TAGS, Notification.FORALL]),
      },
      relations: ['interests'],
    });
  }
}
