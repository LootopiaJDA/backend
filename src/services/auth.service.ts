import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { decryptText } from './crypto.service';


@Injectable()
export class AuthService {
    // Get userService for user data, jwtService for token generation
    constructor(private usersService: UserService, private readonly jwtService: JwtService) { }

    /**
     * Method who check if user exist and compare data password with bdd password.
     *
     * @param {JSON} data - Data connexion (email, password).
     * @returns {<Promise{JSON}>} - JWT token.
     */
    async login(data: { email: string; password: string }): Promise<{ access_token: string }> {
        const user = await this.usersService.findOne(data.email);

        if (!user || !user.password) {
            throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
        }

        const decryptedPassword = await decryptText(user.password);

        if (decryptedPassword !== data.password) {
            throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
        }

        const payload = {
            sub: user.id_user,
            username: user.username,
            role: user.role,
        };

        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET!,
                expiresIn: '1h',
            }),
        };
    }

}