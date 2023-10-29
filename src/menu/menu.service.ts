import { Injectable } from '@nestjs/common';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { Menu } from './menu.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Day } from './enum/day.enum';
import { menuType } from './enum/menu-type.enum';
import { weekType } from './enum/week-type.enum';
import { UpdateMenuDBInput } from './typeDBinput/update-menu.input';
import { CreateMenuDBInput } from './typeDBinput/create-menu.input';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private postRepository: Repository<Menu>
  ) { }

  async getall() {
    return await this.postRepository.find()
  }

  async findbyMenuWeekDayType(day: Day, menuType: menuType, weekType: weekType) {
    return await this.postRepository.findOne({
      where: {
        day: day,
        menuType: menuType,
        weekType: weekType
      }
    })
  }

  async updateItem(updateMenu: UpdateMenuInput) {
    let items = await this.findbyMenuWeekDayType(updateMenu.day,
      updateMenu.menuType,
      updateMenu.weekType);
    let itemId = await items.id;
    let newupdate = new UpdateMenuDBInput()
    newupdate.day = updateMenu.day;
    newupdate.menuType = updateMenu.menuType
    newupdate.weekType = newupdate.weekType
    newupdate.item = ""
    for (let i of updateMenu.item) {
      newupdate.item = newupdate.item + "AND" + i
    }
    return await this.postRepository.update({ id: itemId }, newupdate)
  }

  async createItem(CreateMenuDBItem: CreateMenuInput) {
    let newitem = new CreateMenuDBInput()
    newitem.day = CreateMenuDBItem.day
    newitem.weekType = CreateMenuDBItem.weekType
    newitem.menuType = CreateMenuDBItem.menuType
    newitem.item = ""
    for (let i of CreateMenuDBItem.item) {
      newitem.item = newitem.item + "AND" + i
    }
    return this.postRepository.create(newitem)
  }

}
