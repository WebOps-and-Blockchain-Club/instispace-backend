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
    private readonly userService: UserService,
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
      order:{createdAt:"DESC"}
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

  async resolveTicket(ticket:Ticket, user: User,resolveDescription:string) {
    try {
      let userN = await this.userService.getOneById(user.id, [
        'resolvedTickets',
      ]);
      let Parent = await this.userService.getParents(user);
      let check = Parent.filter(
        (p) => p.roll === 'instispace_cfi@smail.iitm.ac.in',
      );
      if(check.length!==1 && ticket.createdBy.id!==userN.id)
        throw new UnauthorizedException(
          'You are not allowed to resolve this ticket',
        );

      ticket.status = TicketStatus.RESOLVED;
      ticket.resolveDescription=resolveDescription;
      ticket.resolvedBy = userN;

     return await this.ticketRepository.save(ticket);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
