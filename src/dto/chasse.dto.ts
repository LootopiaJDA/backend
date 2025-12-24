import { ApiProperty } from '@nestjs/swagger';
import { StatutChasse } from 'src/generated/prisma/enums';

export class ChasseDto {
  @ApiProperty({ example: 'Chasse au trésor' })
  name: string;

  @ApiProperty({ example: 'Paris' })
  localisation: string;

  @ApiProperty({ example: 'PENDING' })
  etat: StatutChasse;
}

