import { Body, Controller, Get, Post, UseGuards, Param, Res,  } from "@nestjs/common";
import { Response } from "express";
import { ApiTags} from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { EtapeService } from "../services/etape.service";
import { Chasse } from "src/generated/prisma/client";


@ApiTags('Etape')
@Controller('etape')
@UseGuards(AuthGuard)
export class EtapeController {
    // Must inject services to access them
    constructor(private readonly etape: EtapeService) { }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getEtapeByChasse(@Param('id') id: string, @Res() response: Response): Promise<Response> {
        const etape = await this.etape.getEtapeChasse(Number(id));
       
          if(etape) return response.status(200).send(etape.length !== 0 ? etape : {message: "No etape found"})
        return response.status(500).send({message : "Serveur error"})
    }

    @Post()
    async createEtape(): Promise<void> {

    }
}