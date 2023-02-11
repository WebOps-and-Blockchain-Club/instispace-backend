import { Module } from '@nestjs/common';
import { ReportreasonsService } from './reportReasons.service';
import { ReportreasonsResolver } from './reportReasons.resolver';
import { ReportReason } from './reportReasons.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from '../reports/reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportReason])],
  providers: [ReportreasonsResolver, ReportreasonsService],
  exports: [ReportreasonsService],
})
export class ReportreasonsModule {}
