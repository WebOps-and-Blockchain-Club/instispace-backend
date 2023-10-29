import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { Menu } from './menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';

@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) { }

  @Query(() => [Menu])
  async getall() {
    return await this.menuService.getall()
  }

  @Mutation(() => Menu)
  async updateItem(@Args('updateMenu') updateMenu: UpdateMenuInput) {
    return this.menuService.updateItem(updateMenu)
  }

  @Mutation(() => Menu)
  async createItem(@Args('newItem') newItem: CreateMenuInput) {
    return await this.menuService.createItem(newItem)
  }
}