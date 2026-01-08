
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatutChasseDecorator } from 'src/decorators/statut-chasse.decorator';

@Injectable()
export class ActiveGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const etat = this.reflector.get(StatutChasseDecorator, context.getHandler());
    
    const request = context.switchToHttp().getRequest();

    return true;
  }
}
