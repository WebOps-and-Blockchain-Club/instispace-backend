import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { CreateTicketInput } from './types/create-ticket.input';
import { UpdateTicketInput } from './types/update-ticket.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { CurrentUser } from 'src/auth/current_user';

@Resolver(() => Ticket)
export class TicketResolver {
  constructor(
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Ticket)
  async createTicket(
    @Args('createTicketInput') createTicketInput: CreateTicketInput,
    @CurrentUser() user: User,
  ) {
    return await this.ticketService.create(createTicketInput, user);
  }

  @Query(() => [Ticket])
  async getAllTickets() {
    return await this.ticketService.findAll();
  }

  @Query(() => Ticket)
  async getOneTicket(@Args('id') id: string) {
    return await this.ticketService.findOne(id);
  }

  // @Mutation(() => Ticket)
  // updateTicket(
  //   @Args('updateTicketInput') updateTicketInput: UpdateTicketInput,
  // ) {
  //   return this.ticketService.update(updateTicketInput.id, updateTicketInput);
  // }

  @ResolveField(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async canResolve(@CurrentUser() user: User, @Parent() ticket: Ticket) {
    let ticketN = await this.ticketService.findOne(ticket.id);
    console.log(user);

    if (user.id === ticketN.createdBy.id) return true;

    let Parent = await this.userService.getParents(user);

    let check = Parent.filter(
      (p) => p.roll === 'instispace_cfi@smail.iitm.ac.in',
    );
    if (check.length) return true;
    return false;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Ticket)
  resolveTicket(@CurrentUser() user: User, @Args('id') id: string) {
    return this.ticketService.resolveTicket(id, user);
  }

  @ResolveField(() => User)
  async createdBy(@Parent() ticket: Ticket) {
    let ticketN = await this.ticketService.findOne(ticket.id);
    return ticket.createdBy;
  }

  @ResolveField(() => User)
  async resolvedBy(@Parent() ticket: Ticket) {
    let ticketN = await this.ticketService.findOne(ticket.id);
    return ticket.resolvedBy;
  }
}
