import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  User,
  Partenaire,
  Statut,
} from '../generated/prisma/client';

type UserWithPartenaire = User & {
  partener: Partenaire | null;
};

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
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Omit<User, 'id_user' | 'created_at' | 'updated_at'>): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async updateUser(userId: number, data: UserUpdateData): Promise<User> {
    return this.prisma.user.update({
      where: { id_user: userId },
      data,
    });
  }

  async createPartenaire(
    data: Omit<CreatePartenaireUserDto, 'updated_at' | 'created_at'>
  ): Promise<UserWithPartenaire> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'PARTENAIRE',
        partener: {
          create: {
            adresse: data.partenaire.adresse,
            siret: data.partenaire.siret,
            company_name: data.partenaire.company_name,
            statut: Statut.VERIFICATION,
          },
        },
      },
      include: {
        partener: true,
      },
    });
  }
}
