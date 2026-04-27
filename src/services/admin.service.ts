import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UpdateUserDto } from "src/dto/user.tdo";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id_user: true,
          email: true,
          role: true,
          password: false, 
        },
      });
      return users;
    } catch (error) {
      console.error("Error fetching users from database:", error);
      throw new Error("Failed to fetch users from database");
    }
  }

  async updateUserInformations(userId: number, data: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id_user: userId },
        data: { ...data },
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user informations:", error);
      throw new Error("Failed to update user informations");
    }
  }
}
