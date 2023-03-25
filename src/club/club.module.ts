import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from 'src/club/club.entity';
import { ClubService } from './club.service';
import {ClubResolver} from './club.resolver';
import { Badge } from 'src/badge/badge.entity';
import { BadgeModule } from 'src/badge/badge.module';
import { UserModule } from 'src/user/user.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([Club]), 
        forwardRef(()=>BadgeModule),
        UserModule
    ],
    providers: [ClubService, ClubResolver],
    exports:[ClubService]
})
export class ClubModule {}
