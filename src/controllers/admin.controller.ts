import { Controller, Get, Patch, Res, UseGuards, Body, Param, Post } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { Roles } from "src/decorators/role.decorator";
import { UpdateUserDto } from "src/dto/user.tdo";
import { Role } from "src/generated/prisma/enums";
import { AuthGuard } from "src/guards/auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { AdminService } from "src/services/admin.service";
import { encryptText } from "src/services/crypto.service";

@ApiBearerAuth('access-token')
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

  @Patch("/users/:id")
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateUserDto })
  @UseGuards(AuthGuard, RolesGuard)
  async updateUsersInformations(@Res() res: Response, @Body() data: UpdateUserDto, @Param('id') id: string): Promise<Response> {
    try { 
    if(data.password){
      data.password = await encryptText(data.password as string);
    }
    await this.adminService.updateUserInformations(Number(id), data);
    return res.status(200).json({ message: "User informations updated successfully" });
    } catch (error) {
      console.error("Error updating user informations:", error);
      return res.status(500).json({ message: "Failed to update user informations" });
    }
  } 

  // Validation d'un compte partenaire
  @Post("/partenaire/:id/validate")
  @Roles(Role.ADMIN)
  @ApiBody({ schema: { properties: { statut: { type: "string", enum: ["ACTIVE", "INACTIVE"] } } } })
  @UseGuards(AuthGuard, RolesGuard)
  async validatePartenaireAccount(@Res() res: Response, @Param('id') id: string, @Body("statut") statut: "ACTIVE" | "INACTIVE"): Promise<Response> {
    try {
      await this.adminService.validatePartenaireAccount(Number(id), statut);
      return res.status(200).json({ message: "Partenaire account validated successfully" });
    } catch (error) {
      console.error("Error validating partenaire account:", error);
      return res.status(500).json({ message: "Failed to validate partenaire account" });
    }
  }
  
  // Accès à toutes les chasses avec étape et occurence

}
