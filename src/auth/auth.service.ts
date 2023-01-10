import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
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
                delete user.password;
                return user;
            }
        }
        return null;
    }

    // login
    async generateToken(user: string) {
        const payload = {
            sub: user
        };

        return {
            accessToken: this.jwtTokenService.sign(payload),
        };
    }
}