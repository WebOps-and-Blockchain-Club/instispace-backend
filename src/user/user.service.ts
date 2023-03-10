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
import MailService from '../utils/mail';
import {
  adminEmail,
  adminPassword,
  accountPassword,
  usersDevList,
} from 'src/utils/config.json';
import UsersDev from './usersDev.entity';
import { LdapService } from 'src/ldap/ldap.service';
import { NotificationService } from 'src/notification/notification.service';

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
    // @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @Inject(LdapService)
    private ldapService: LdapService,
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
  ) {}

  async login({ roll, pass }: LoginInput) {
    try {
      if (emailExpresion.test(roll) === false) {
        let ldapUser: any;
        if (process.env.NODE_ENV === 'production') {
          // Check with LDAP
          ldapUser = await this.ldapService.auth(roll, pass);
          if (!ldapUser) throw new Error('Invalid Credentials');
        } else {
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
        }

        /************ Check the user details ************/
        const user = await this.usersRepository.findOne({
          where: { roll: roll.toLowerCase() },
          relations: ['notificationConfig'],
        });
        // If user doesn't exists
        if (!user) {
          const newUser = this.usersRepository.create();
          newUser.roll = roll.toLowerCase();
          newUser.role = UserRole.USER;
          newUser.ldapName = ldapUser.displayName;
          newUser.isNewUser = true;
          await this.notificationService.createNotificationConfig(user, fcmToken);
          await this.usersRepository.save(newUser);
          const token = (await this.authService.generateToken(newUser))
            .accessToken;
          return { isNewUser: newUser.isNewUser, role: UserRole.USER, token };
        }
        // If user exists
        else {
          if (
            user?.notificationConfig?.filter((n) => n.fcmToken === fcmToken)
              .length === 0
          ) {
            let notificationConfig =
              await this.notificationService.createNotificationConfig(
                user,
                fcmToken,
              );
            console.log(notificationConfig);
          }
          const token = (await this.authService.generateToken(user))
            .accessToken;
          return {
            isNewUser: user.isNewUser,
            role: user.role,
            token,
          };
        }
      }
      // For superusers
      else {
        if (process.env.NODE_ENV !== 'production') {
          const admins = await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
            relations: ['notificationConfig'],
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
        if (!user)
          throw new BadRequestException(`Email or password are invalid`);
        else {
          const token = (await this.authService.generateToken(user))
            .accessToken;
          if (
            user.notificationConfig.filter((n) => n.fcmToken === fcmToken)
              .length === 0
          ) {
            await this.notificationService.createNotificationConfig(
              user,
              fcmToken,
            );
          }
          return {
            isNewUser: user.isNewUser,
            role: user.role,
            token,
          };
        }
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getAll(): Promise<User[]> {
    try {
      return this.usersRepository.find();
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async getSuperusers(lastUserId: string, take: number, search?: string) {
    try {
      let usersList: User[] = [];
      if (search) {
        await Promise.all(
          ['name', 'ldapName', 'roll'].map(async (field: string) => {
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
          where: {
            role: In([
              UserRole.DEV_TEAM,
              UserRole.HOSTEL_SEC,
              UserRole.LEADS,
              UserRole.SECRETARY,
            ]),
          },
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
      return { list: finalList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  getOneById(id: string, relations?: string[]): Promise<User> {
    try {
      return this.usersRepository.findOne({
        where: { id: id },
        relations,
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async updateUser(
    userToUpdate: User,
    userInput: UpdateUserInput,
  ): Promise<User> {
    try {
      if (userInput.name) userToUpdate.name = userInput.name;
      if (userInput.mobile)
        userToUpdate.mobile = userToUpdate.password = userInput.mobile;
      if (userInput.photoUrl) userToUpdate.photo = userInput.photoUrl;
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
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getOneByRoll(roll: string): Promise<User> {
    try {
      return this.usersRepository.findOne({
        where: { roll },
        relations: ['hostel', 'interests'],
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async getParents(child: User): Promise<User[]> {
    try {
      const parents = await this.usersRepository.findAncestors(child, {
        relations: ['permission'],
      });
      return parents;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async getAncestorswithAprrovalAccess(child: User): Promise<User[]> {
    try {
      let parents = await this.getParents(child);
      parents = parents.filter((p) => p.permission.approvePosts === true);
      return parents;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getDescendantsTree(parent: User) {
    try {
      return this.usersRepository.findDescendantsTree(parent);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getChildren(parent: User): Promise<User[]> {
    try {
      return this.usersRepository.findDescendants(parent, {
        relations: ['permission'],
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async create(
    currentUser: User,
    roll: string,
    permissionInput: PermissionInput,
    role: UserRole,
    ldapName?: string,
  ): Promise<User> {
    try {
      let user = this.usersRepository.create();
      user.roll = roll;
      user.ldapName = ldapName;
      user.role = role;
      let password =
        process.env.NODE_ENV === 'development'
          ? accountPassword
          : autoGenPass(8);
      // TODO: mail this password
      user.password = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
      );
      if (process.env.NODE_ENV === 'production')
        MailService.sendAccountCreationMail(user.role, user.roll, password);

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
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  // Not bieng used
  async validate(roll: string) {
    try {
      let user = await this.usersRepository.findOne({ where: { roll } });
      // TODO: Check the password
      const isPasswordCorrect = true;
      if (isPasswordCorrect) {
        return user;
      }
      return null;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async hostel(name: string, user: User) {
    try {
      let hostel = await this.hostelRepository.findOne({ where: { name } });
      let currUser = await this.usersRepository.findOne({
        where: { id: user.id },
      });
      currUser.hostel = hostel;
      this.usersRepository.save(currUser);
      return hostel;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async usersForNotif() {
    try {
      return await this.usersRepository.find({
        relations: ['interests', 'notificationConfig'],
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getprogramme = (roll: string) => {
    try {
      let roll_number = roll.toUpperCase();
      let prog = roll_number[4];
      let branch = roll_number.slice(0, 2);

      switch (prog) {
        case 'B':
          if (
            branch == 'ED' ||
            branch == 'BS' ||
            branch == 'BE' ||
            branch == 'PH'
          ) {
            return 'Dual Degree';
          } else {
            return 'B.Tech';
          }
        case 'D':
          return 'Ph.D';

        case 'C':
          return 'MSc';

        case 'S':
          return 'MS';

        case 'W':
          return 'EMBA';

        case 'A':
          return 'MBA';

        case 'M':
          return 'M.Tech';

        case 'F':
          return 'FN';

        case 'Z':
          return 'ES';

        case 'V':
          return 'VLM';

        case 'H':
          return 'MA';
        default:
          return 'Null';
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  };
}
