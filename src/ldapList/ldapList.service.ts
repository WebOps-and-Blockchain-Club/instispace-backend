import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ILike, Repository } from 'typeorm';
import { LdapList } from './ldapList.entity';
import { CreateLdapListInput } from './types/create-ldap-list.input';
import { Gender } from './types/gender-enum';
import { LdapFilteringConditions } from './types/ldap-filteringConditions';
import { UpdateLdapListInput } from './types/update-ldap-list.input';

@Injectable()
export class LdapListService {
  constructor(
    @InjectRepository(LdapList) private ldapRepository: Repository<LdapList>,
  ) {}
  async create(createLdapListInput: CreateLdapListInput) {
    try {
      let newEntry = new LdapList();
      newEntry.gender = createLdapListInput.gender;
      newEntry.ldapName = createLdapListInput.ldapName;
      newEntry.program = createLdapListInput.program;
      newEntry.roll = createLdapListInput.roll;
      newEntry.sem = createLdapListInput.sem;
      newEntry.advisor = createLdapListInput.advisor;
      newEntry.residencyType = createLdapListInput.residencyType;
      newEntry.department = await this.getDepartment(newEntry.roll.slice(0, 2));
      return await this.ldapRepository.save(newEntry);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  findAll() {}

  findOne(id: number) {
    return `This action returns a #${id} ldapList`;
  }

  update(id: number, updateLdapListInput: UpdateLdapListInput) {
    return `This action updates a #${id} ldapList`;
  }

  remove(id: number) {
    return `This action removes a #${id} ldapList`;
  }

  async getUsers(
    lastUserId: string,
    take: number,
    filteringConditions: LdapFilteringConditions,
  ) {
    try {
      let usersList: LdapList[] = [];
      if (filteringConditions && filteringConditions.search) {
        await Promise.all(
          ['roll', 'ldapName'].map(async (field: string) => {
            const filter = {
              [field]: ILike(`%${filteringConditions.search}%`),
            };
            const userF = await this.ldapRepository.find({ where: filter });
            userF.forEach((user) => {
              usersList.push(user);
            });
          }),
        );

        const userStr = usersList.map((obj) => JSON.stringify(obj));
        const uniqueUserStr = new Set(userStr);
        usersList = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
      } else {
        usersList = await this.ldapRepository.find();
      }
      if (filteringConditions) {
        if (filteringConditions.batch) {
          usersList = usersList.filter(
            (e) => e.roll.slice(2, 4) === filteringConditions.batch,
          );
        }
        if (filteringConditions.gender) {
          usersList = usersList.filter(
            (e) => e.gender === filteringConditions.gender,
          );
        }
        if (filteringConditions.program) {
          usersList = usersList.filter(
            (e) => e.program === filteringConditions.program,
          );
        }
        if (filteringConditions.department) {
          usersList = usersList.filter((e) =>
            e.department
              .toLowerCase()
              .includes(filteringConditions.department.toLowerCase()),
          );
        }
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

  async populateUser(csvUrl: string, program: string) {
    try {
      let x;
      try {
        x = await axios.get(csvUrl);
      } catch (error) {
        throw new Error(`message : ${error}`);
      }
      let data = x.data;
      const list = data.split('\n');
      var final: string[][] = [];
      await Promise.all(
        list.map(async (item) => {
          let arr = item.split(',');
          final.push(arr);
        }),
      );
      final.shift();

      for (const x of final) {
        try {
          let newUser = new CreateLdapListInput();
          x[5].replace(/"/g, '') === 'M'
            ? (newUser.gender = Gender.Male)
            : (newUser.gender = Gender.Female);
          newUser.program = program;
          newUser.roll = x[1].replace(/"/g, '');
          let name = x[2].replace(/"/g, '');
          let lastName = x[3].replace(/"/g, '');
          if (lastName !== '') name = name + ' ' + lastName;
          newUser.ldapName = name;
          newUser.sem = x[4].replace(/"/g, '');
          newUser.advisor = x[6].replace(/"/g, '');
          newUser.residencyType = x[8].replace(/"/g, '');
          await this.create(newUser);
        } catch (error) {
          throw new Error(`message : ${error}`);
        }
      }
      return 'entries added successfully';
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  getDepartment = (code: string) => {
    try {
      let deptCode = code.toUpperCase();
      switch (deptCode) {
        case 'AE':
          return 'Aerospace Engineering';
        case 'AM':
          return 'Applied Mechanics';
        case 'BE':
          return 'Biotechnology';
        case 'BS':
          return 'Biotechnology';
        case 'BT':
          return 'Biotechnology';
        case 'CH':
          return 'Chemical Engineering';
        case 'CY':
          return 'Chemistry';
        case 'CE':
          return 'Civil Engineering';
        case 'CS':
          return 'Computer Science and Engineering';
        case 'EE':
          return 'Electrical Engineering';
        case 'ED':
          return 'Engineering Design';
        case 'EP':
          return 'Physics';
        case 'HS':
          return 'Humanities and Social Sciences';
        case 'MS':
          return 'Management Studies';
        case 'MA':
          return 'Mathematics';
        case 'ME':
          return 'Mechanical Engineering';
        case 'MM':
          return 'Metallurgical and Materials Engineering';
        case 'OE':
          return 'Ocean Engineering';
        case 'NA':
          return 'Ocean Engineering';
        case 'PH':
          return 'Physics';
        default:
          return 'Null';
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  };
}
