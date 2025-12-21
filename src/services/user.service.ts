import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

type User = Prisma.UserGetPayload<{}>;
type UserWithPartenaire = Prisma.UserGetPayload<{
  include: { partener: true };
}>;

interface UserUpdateData {
  username?: string;
  email?: string;
  password?: string;
}

interface CreatePartenaireUserDto {
  username: string;
  email: string;
  password: string;
  partenaire: {
    adresse?: string;
    siret: string;
    company_name: string;
    updated_at?: Date;
    created_at?: Date;
  };
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateUser(userId: number, data: UserUpdateData): Promise<User> {
    return this.prisma.user.update({
      where: { id_user: Number(userId) },
      data,
    });
  }

  async createPartenaire(
    data: CreatePartenaireUserDto
  ): Promise<UserWithPartenaire> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'PARTENAIRE',
        partener: {
          create: {
            adresse: data.partenaire.adresse || undefined,
            siret: data.partenaire.siret,
            company_name: data.partenaire.company_name,
            updated_at: data.partenaire.updated_at || new Date(),
            created_at: data.partenaire.created_at || new Date(),
          },
        },
      },
      include: { partener: true },
    });
  }
}
