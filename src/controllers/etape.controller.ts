import { Body, Controller, Get, Post, Patch, Req, Res, UploadedFile, UseGuards, UseInterceptors, Param, Delete } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";


@ApiTags('Etape')
@Controller('etape')
@UseGuards(AuthGuard)
export class EtapeController {
    // Must inject services to access them
    constructor(private readonly EtapeService) { }

}