import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ILike, Repository } from 'typeorm';
import { LdapList } from './ldapList.entity';
import { CreateLdapListInput } from './types/create-ldap-list.input';
import { UpdateLdapListInput } from './types/update-ldap-list.input';

@Injectable()
export class LdapListService {
  constructor(
    @InjectRepository(LdapList) private ldapRepository: Repository<LdapList>,
  ) {}
  async create(createLdapListInput: CreateLdapListInput) {
    let newEntry = new LdapList();
    newEntry.gender = createLdapListInput.gender;
    newEntry.ldapName = createLdapListInput.ldapName;
    newEntry.program = createLdapListInput.program;
    newEntry.roll = createLdapListInput.roll;
    newEntry.sem = createLdapListInput.sem;
    return await this.ldapRepository.save(newEntry);
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

  async getUsers(lastUserId: string, take: number, search?: string) {
    try {
      let usersList: LdapList[] = [];
      if (search) {
        await Promise.all(
          ['roll', 'ldapName'].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
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

  async populateUser(csvUrl: string, program: string) {
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
        console.log(x);
        newUser.gender = x[5].replace(/"/g, '');
        newUser.program = program;
        newUser.roll = x[1].replace(/"/g, '');
        let name = x[2].replace(/"/g, '');
        let lastName = x[3].replace(/"/g, '');
        if (lastName !== '') name = name + ' ' + lastName;
        newUser.ldapName = name;
        newUser.sem = x[4].replace(/"/g, '');
        console.log(newUser);
        await this.create(newUser);
      } catch (error) {
        throw new Error(`message : ${error}`);
      }
    }
    return 'entries added successfully';
  }
}
