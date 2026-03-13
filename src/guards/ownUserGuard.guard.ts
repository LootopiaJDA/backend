import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/services/user.service';

@Injectable()
export class ownUserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const user = request.user;
    const paramsId = Number(request.params.id);

    // Vérifier que l'utilisateur est un partenaire
    if (user.sub === paramsId || user.role === 'ADMIN') {
      return true;
    } else {
        return false
    }
  }
}
