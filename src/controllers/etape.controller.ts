import { Body, Controller, Get, Post, UseGuards, Param, Res, Req,  } from "@nestjs/common";
import { Response } from "express";
import { ApiBody, ApiTags} from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { EtapeService } from "../services/etape.service";
import { Chasse, Etape } from "src/generated/prisma/client";
import { Roles } from "src/decorators/role.decorator";
import { RequestWithUser } from "src/interface/user.interface";
import { ChasseOwnershipGuard } from "src/guards/ChasseOwnershipGuard.guard";
import { EtapeDto } from "src/dto/etape.dto";


@ApiTags('Etape')
@Controller('etape')
@UseGuards(AuthGuard)
export class EtapeController {
    // Must inject services to access them
    constructor(private readonly etape: EtapeService) { }

    @Get(':id')
    @Roles('JOUEUR')
    async getEtapeByChasse(@Param('id') id: string, @Res() response: Response): Promise<Response> {
        const etape = await this.etape.getEtapeChasse(Number(id));
       
        if(etape) return response.status(200).json(etape.length !== 0 ? etape : {message: "No etape found"})
        return response.status(500).json({message : "Serveur error"})
    }

    @Post(':id')
    @Roles('PARTENAIRE')
    @UseGuards(ChasseOwnershipGuard)
    @ApiBody({type:EtapeDto})
    // @ApiBody()
    async createEtape(@Param('id') id: string, @Body() body: Omit<Etape,'updated_at'|'created_at'| 'chasse_id'>): Promise<void> {
        await this.etape.createEtape(Number(id),body)
    }
}