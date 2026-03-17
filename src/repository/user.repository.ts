import { Injectable } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";


@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        username: true,
        email: true,
        password: false,
        role: true,
        partener: {
          select: {
            id_partenaire: true,
            statut: true,
            siret: true,
            company_name: true,
            adresse: true,
            created_at: false,
            updated_at: false,
          },
        },
      },
    });
  }
}
