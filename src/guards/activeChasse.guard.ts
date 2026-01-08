
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatutChasseDecorator } from 'src/decorators/statut-chasse.decorator';

@Injectable()
export class ActiveGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.reflector.get(StatutChasseDecorator, context.getHandler());
    
    context.switchToHttp().getRequest();

    return true;
  }
}
