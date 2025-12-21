import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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

        // If user not found, throw error http 403
        if (!user) {
            throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
        }
        // Decrypt password and compare with data password, throw error http 403 if not matching
        if (await decryptText(user?.password!) !== data.password) {
            throw new HttpException('Password or email incorrect', HttpStatus.FORBIDDEN);
        }

        // Create JWT payload with user's data
        const payload = { sub: user?.id_user, username: user?.username, role: user?.role };

        // Chiff jwt by the payload and secret finally return it
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '1h',
            }),
        };
    }
}