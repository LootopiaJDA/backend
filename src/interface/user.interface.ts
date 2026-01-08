import { Request } from "@nestjs/common";
export interface RequestWithUser extends Request {
  user: {
    sub: number;
    username: string;
    role: string;
    partenaire?: {
      id_partenaire: number;
      statut: string;
    };
  };
}