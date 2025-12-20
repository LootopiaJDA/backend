import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { decryptText } from './crypto.service';


    @Injectable()
    export class AuthService {
        constructor(private usersService: UserService, private readonly jwtService: JwtService) { }

        async login(data: { email: string; password: string }): Promise<{ access_token: string }> {
            const user = await this.usersService.findOne(data.email);
            
            if(!user) {
                throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
            }
            
            if (await decryptText(user?.password!) !== data.password) {
                throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
            }

            const payload = { sub: user?.id_user, username: user?.username, role: user?.role };

            return {
                access_token: await this.jwtService.signAsync(payload, {
                    secret: process.env.JWT_SECRET,
                    expiresIn: '1h',
                }),
            };
        }
    }