import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTicketInput } from './types/create-ticket.input';
import { UpdateTicketInput } from './types/update-ticket.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { TicketStatus } from 'src/utils';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    private readonly userServive: UserService,
  ) {}

  async create(createTicketInput: CreateTicketInput, user: User) {
    let ticket = this.ticketRepository.create({
      ...createTicketInput,
    });
    ticket.createdBy = user;
    return await this.ticketRepository.save(ticket);
  }

  async findAll() {
    return await this.ticketRepository.find({
      relations: ['createdBy', 'resolvedBy'],
    });
  }

  async findOne(id: string) {
    return await this.ticketRepository.findOne({
      where: { id },
      relations: ['createdBy', 'resolvedBy'],
    });
  }

  update(id: number, updateTicketInput: UpdateTicketInput) {
    return `This action updates a #${id} ticket`;
  }

  async resolveTicket(id: string, user: User) {
    try {
      let userN = await this.userServive.getOneById(user.id, [
        'resolvedTickets',
      ]);
      let ticketN = await this.findOne(id);
      console.log(ticketN.canResolve);
      if (!ticketN.canResolve)
        throw new UnauthorizedException(
          'You are not allowed to resolve this ticket',
        );

      ticketN.status = TicketStatus.RESOLVED;
      ticketN.resolvedBy = userN;

      this.ticketRepository.save(ticketN);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
