import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { CreateTicketInput } from './types/create-ticket.input';
import { UpdateTicketInput } from './types/update-ticket.input';


@Resolver(() => Ticket)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @Mutation(() => Ticket)
  createTicket(@Args('createTicketInput') createTicketInput: CreateTicketInput) {
    return this.ticketService.create(createTicketInput);
  }

  @Query(() => [Ticket], { name: 'ticket' })
  findAll() {
    return this.ticketService.findAll();
  }

  @Query(() => Ticket, { name: 'ticket' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ticketService.findOne(id);
  }

  @Mutation(() => Ticket)
  updateTicket(@Args('updateTicketInput') updateTicketInput: UpdateTicketInput) {
    return this.ticketService.update(updateTicketInput.id, updateTicketInput);
  }

  @Mutation(() => Ticket)
  removeTicket(@Args('id', { type: () => Int }) id: number) {
    return this.ticketService.remove(id);
  }
}
