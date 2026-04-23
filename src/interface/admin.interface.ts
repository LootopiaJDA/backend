export interface AdlinInterface {
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