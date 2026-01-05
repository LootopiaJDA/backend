import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ChasseService } from 'src/services/chasse.service';

@Injectable()
export class ChasseOwnershipGuard implements CanActivate {
  constructor(private readonly chasseService: ChasseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier que l'utilisateur est un partenaire
    if (!user?.partenaire) {
      return false;
    }

    // ID de la chasse depuis l'URL
    const chasseId = Number(request.params.id);
    if (Number.isNaN(chasseId)) {
      return false;
    }

    // Charger la chasse
    const chasse = await this.chasseService.getChasseById(chasseId);
    if (!chasse) {
      return false;
    }
   
    // Vérifier la propriété
    return chasse.idPartenaire === user.partenaire.id_partenaire;
  }
}
