
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
     const token = request.cookies?.access_token;
     
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }
      const payload = await this.jwtService.verifyAsync(token);
      
      request['user'] = payload;

    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
