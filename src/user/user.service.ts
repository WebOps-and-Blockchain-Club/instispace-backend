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
  user_permission,
} from 'src/utils/config.json';
import UsersDev from './usersDev.entity';
import { LdapService } from 'src/ldap/ldap.service';
import { NotifConfigService } from 'src/notif-config/notif-config.service';
import { CreateNotifConfigInput } from 'src/notif-config/type/create-notif-config.input';
import MailService from 'src/utils/mail';

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
    @Inject(forwardRef(() => NotifConfigService))
    private notifService: NotifConfigService,
  ) {}

  async login({ roll, pass }: LoginInput, fmcToken: string) {
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
        newUser.permission = await this.permissionService.getOneById(
          user_permission,
        );
        let newConfig = new CreateNotifConfigInput();
        newConfig.fcmToken = fmcToken;
        let createdUser = await this.usersRepository.save(newUser);
        this.notifService.create(newConfig, createdUser);
        const token = (await this.authService.generateToken(createdUser))
          .accessToken;
        return { isNewUser: createdUser.isNewUser, role: UserRole.USER, token };
      }
      // If user exists
      else {
        let newConfig = new CreateNotifConfigInput();
        newConfig.fcmToken = fmcToken;
        this.notifService.create(newConfig, user);

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

          let newConfig = new CreateNotifConfigInput();
          newConfig.fcmToken = fmcToken;
          this.notifService.create(newConfig, admin);

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

        let newConfig = new CreateNotifConfigInput();
        newConfig.fcmToken = fmcToken;
        this.notifService.create(newConfig, user);

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

  getOneById(id: string, relations?: string[]): Promise<User> {
    if (!relations) relations = ['permission'];
    if (!relations?.includes('permission')) relations.push('permission');
    return this.usersRepository.findOne({
      where: { id: id },
      relations,
    });
  }

  async updateUser(
    userToUpdate: User,
    userInput: UpdateUserInput,
  ): Promise<User> {
    if (userInput.name) userToUpdate.name = userInput.name;
    if (userInput.mobile) userToUpdate.mobile = userInput.mobile;
    if (userInput.password)
      userToUpdate.password = bcrypt.hashSync(
        userInput.password,
        bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
      );
    if (userInput.photo) userToUpdate.photo = userInput.photo;
    if (userInput.forgotPassword)
      userToUpdate.forgotPassword = userInput.forgotPassword;
    if (userInput.forgotPassword == null) userToUpdate.forgotPassword = null;

    if (userInput.interests) {
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

  async forgotPassword({ roll, password, newpass }) {
    let user = await this.usersRepository.findOne({ where: { roll } });

    //if password (new) is provided, validate
    if (password) {
      let isvalid = user.forgotPassword
        ? bcrypt.compareSync(password, user.forgotPassword)
        : false;

      if (isvalid) {
        // const pass_hash = bcrypt.hashSync(
        //   newpass,
        //   bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
        // );
        await this.updateUser(user, {
          password: newpass,
          forgotPassword: null,
        });

        return true;
      }
      throw new BadRequestException(`Email or password are invalid`);
    }

    //else just send a mail with the generated passsword
    password =
      process.env.NODE_ENV === 'production' ? autoGenPass(8) : accountPassword;
    let hash = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
    );

    await this.updateUser(user, {
      forgotPassword: hash,
    });

    if (process.env.NODE_ENV === 'production') {
      MailService.sendAccountCreationMail(user.role, user.roll, password);
      return true;
    }
    return false;
  }

  async updateRole(roll: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { roll } });
      if (!user) throw new Error("User doesn't exist");
      if (user.role !== UserRole.USER) throw new Error('Invalid Role');
      user.role = UserRole.MODERATOR;
      const updatedUser = await this.usersRepository.save(user);
      return updatedUser;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  getOneByRoll(roll: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { roll },
      relations: ['hostel', 'interests'],
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

  async getReportHandlers() {
    return await this.usersRepository.find({
      where: { role: UserRole.SECRETARY || UserRole.MODERATOR },
    });
  }

  async create(
    currentUser: User,
    roll: string,
    permissionInput: PermissionInput,
    role: UserRole,
    ldapName?: string,
  ) {
    let user = this.usersRepository.create();
    user.roll = roll;
    user.ldapName = ldapName;
    user.role = role;
    let password =
      process.env.NODE_ENV === 'production' ? autoGenPass(8) : accountPassword;
    user.password = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(Number(process.env.ITERATIONS!)),
    );
    let permission = await this.permissionService.getOne(permissionInput);
    if (!permission)
      permission = await this.permissionService.create(permissionInput);
    user.permission = permission;
    user.createdBy = currentUser;
    let newUser = await this.usersRepository.save(user);
    if (process.env.NODE_ENV === 'production')
      MailService.sendAccountCreationMail(newUser.role, newUser.roll, password);
    return newUser;
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
