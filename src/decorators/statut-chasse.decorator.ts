import { SetMetadata } from "@nestjs/common";
import { StatutChasse } from "src/generated/prisma/enums";

export const StatutChasseDecorator = (...statut: StatutChasse[]) => { SetMetadata('statut_chasse', statut) }