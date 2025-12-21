import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma, Statut } from '@prisma/client';
import { Partenaire } from 'src/generated/prisma/client';

// Interface for user update data
interface UserUpdateData {
    username?: string;
    email?: string;
    password?: string;
}
// Interface for creating a partenaire user
interface CreatePartenaireUserDto {
    username: string;
    email: string;
    password: string;

    partenaire: {
        adresse: string;
        telephone: string;
        siret: string;
        company_name: string;
        statut: string;
    };
}

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }
    /**
     * Return a single user.
     *
     * @param {string} email - Email of the user.
     * @returns {Promise<User | null>} - User or null if not found.
     */
    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    /**
     * Create a new user.
     *
     * @param {Prisma.UserCreateInput} data - Data to create the user.
     * @returns {Promise<User>} - Created user.
     */
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        try {
            return await this.prisma.user.create({ data });
        } catch (e) {
            // Handle unique constraint violation for email
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new Error('User with this email already exists');
                }
            }
            throw e;
        }
    }
    /**
     * Get all users.
     *
     * @returns {Promise<User[]>} - Users list.
     */
    async getAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }
    /**
     * Update single user and specific fields.
     *
     * @returns {Promise<User>} - Updated user.
     */
    async updateUser(userId: number, data: UserUpdateData): Promise<User> {
        return this.prisma.user.update({
            where: { id_user: Number(userId) },
            data,
        });
    }
    /**
     * Create user and partenair.
     * @param {CreatePartenaireUserDto} data - Data to create user and partenair.
     * @returns {Promise<User & { partener: Partenaire | null }>} - Created user/partenair.
     */
    async createPartenaire(
        data: CreatePartenaireUserDto
    ): Promise<User & { partener: Partenaire | null }> {
        try {
            return await this.prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    role: 'PARTENAIRE',
                    partener: {
                        create: {
                            adresse: data?.partenaire.adresse,
                            siret: data.partenaire.siret,
                            company_name: data.partenaire.company_name,
                            statut: Statut.VERIFICATION,
                            updated_at: new Date(),
                        },
                    },
                },
                include: {
                    partener: true,
                },
            });
        } catch (e) {
            // Handle unique constraint violation for email
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new Error('User with this email already exists');
                }
            }
            throw e;
        }
    }

}
