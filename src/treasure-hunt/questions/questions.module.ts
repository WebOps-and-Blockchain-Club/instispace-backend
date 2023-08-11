import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsResolver } from './questions.resolver';
import { UserModule } from 'src/user/user.module';
import { Question } from './question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [QuestionsResolver, QuestionsService],
  imports:[ TypeOrmModule.forFeature([Question]),UserModule],
  exports:[QuestionsService]
})
export class QuestionsModule {}
