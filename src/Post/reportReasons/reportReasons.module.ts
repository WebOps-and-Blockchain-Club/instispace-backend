import { Module } from '@nestjs/common';
import { ReportreasonsService } from './reportreasons.service';
import { ReportreasonsResolver } from './reportreasons.resolver';
import { ReportReason } from './reportReasons.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from '../reports/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportReason])],
  providers: [ReportreasonsResolver, ReportreasonsService],
  exports: [ReportreasonsService],
})
export class ReportreasonsModule {}
