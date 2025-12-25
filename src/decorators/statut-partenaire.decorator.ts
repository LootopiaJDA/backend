// src/decorators/statut-partenaire.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Statut } from 'src/generated/prisma/enums';

export const STATUT_KEY = 'statut';

export const Statuts = (...statuts: Statut[]) =>
  SetMetadata(STATUT_KEY, statuts);
