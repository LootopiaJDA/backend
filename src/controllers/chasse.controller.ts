import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from 'express';
import { ApiTags, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { Role, Roles } from "src/decorators/role.decorator";
import { RolesGuard } from "src/guards/roles.guard";
import { AuthGuard } from "src/guards/auth.guard";

@ApiTags('Chasse')
@Controller('chasse')
export class ChasseController {
    // Controller methods will go here
}