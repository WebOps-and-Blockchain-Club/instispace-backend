import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketResolver } from './ticket.resolver';
import { UserModule } from 'src/user/user.module';
import { Ticket } from './ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [TicketResolver, TicketService],
  imports: [TypeOrmModule.forFeature([Ticket]), UserModule],
})
export class TicketModule {}
