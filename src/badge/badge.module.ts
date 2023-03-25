import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from 'src/club/club.entity';
import { ClubModule } from 'src/club/club.module';
import { UserModule } from 'src/user/user.module';
import { Badge } from './badge.entity';
import { BadgeResolver } from './badge.resolver';
import { BadgeService } from './badge.service';

@Module({
    imports:[
        TypeOrmModule.forFeature([Badge]),
        forwardRef(()=>ClubModule),
        UserModule,
    ],
    providers: [BadgeService, BadgeResolver],
    exports: [BadgeService]
})
export class BadgeModule {}
