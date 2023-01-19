import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private jwtTokenService: JwtService,
    ) { }

    async validateUser(roll: string, password: string): Promise<any> {
        const user = await this.userService.getOneByRoll(roll);
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                delete user.password; //WHY
                return user;
            }
        }
        return null;
    }

    async generateToken(user: User) {
        const payload = {
            sub: user.id
        };

        return {
            accessToken: this.jwtTokenService.sign(payload),
        };
    }
}