import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Roles } from "src/decorators/role.decorator";
import { Role } from "src/generated/prisma/enums";
import { AuthGuard } from "src/guards/auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { AdminService } from "src/services/admin.service";

@ApiTags("Administrateur")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("/users")
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async getAllUsers(@Res() res: Response): Promise<Response> {
    try {
      const request = await this.adminService.getAllUsers();
      if (request.length === 0) {
        return res.status(404).send({ message: "No users found" });
      } else {
        return res.status(200).send(request);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
    return res;
  }
}
