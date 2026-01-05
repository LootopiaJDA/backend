// src/guards/statut.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { STATUT_KEY } from 'src/decorators/statut-partenaire.decorator';
import { Statut } from 'src/generated/prisma/enums';

@Injectable()
export class StatutPartenerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    
    const statutsAutorises = this.reflector.get<Statut[]>(
      STATUT_KEY,
      context.getClass(),
    );

    if (!statutsAutorises) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    
    if (!user.partenaire) {
      return false;
    }

    const statutPartenaire: Statut = user.partenaire.statut;

    return statutsAutorises.includes(statutPartenaire);
  }
}
