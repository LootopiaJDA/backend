import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { StatutChasse } from 'src/generated/prisma/enums';

export class ChasseDto {
  @ApiProperty({ example: 'Chasse au trésor' })
  name: string;

  @ApiProperty({ example: 'Paris' })
  localisation: string;

  @ApiProperty({ example: 'PENDING' })
  etat: StatutChasse;

  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  @IsString()
  @Type(() => String)
  latitude: string;
  
  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  @IsString()
  @Type(() => String)
  longitude: string;
}

