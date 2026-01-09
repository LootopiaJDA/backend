import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBase64, IsNumber, IsString } from 'class-validator';


export class EtapeDto {
  @ApiProperty({ example: 'Indice 1' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  @IsString()
   @Type(() => String)
  lat: string;

  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  @IsString()
  @Type(() => String)
  long: string;

  @ApiProperty({ example: '3 rue de la libertée'})
  @IsString()
  @Type(() => String)
  address: string

  @ApiProperty({example: 'Je suis bleu et orange' })
  @IsString()
  @Type(() => String)
  description: string

  @ApiProperty({example: 35})
  @IsNumber()
  @Type(() => Number)
  rayon: number

  @ApiProperty({example: '3'})
  @IsNumber()
  @Type(() => Number)
  rank: number

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image de l\'étape'
  })
  image: any
}

