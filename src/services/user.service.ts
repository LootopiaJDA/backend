import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

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
}
