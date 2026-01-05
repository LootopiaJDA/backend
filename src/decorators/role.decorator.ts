
import { SetMetadata } from '@nestjs/common';

// Role definitions for access control
export enum Role {
    ADMIN = 'ADMIN',
    PARTENAIRE = 'PARTENAIRE',
    JOUEUR = 'JOUEUR',
}

// Custom decorator to assign roles to route handlers
export const ROLES_KEY = 'roles';
// Stores the roles metadata for the decorated route handler (in the header of the request)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
