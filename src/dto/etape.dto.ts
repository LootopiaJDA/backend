import { ApiProperty } from '@nestjs/swagger';


export class EtapeDto {
  @ApiProperty({ example: 'Indice 1' })
  name: string;

  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  lat: string;

  @ApiProperty({ example: `41°24'12.2"N 2°10'26.5"E` })
  long: number;

  @ApiProperty({ example: '3 rue de la libertée'})
  address: string

  @ApiProperty({example: 'Je suis bleu et orange' })
  description: string

  @ApiProperty({example: 35})
  rayon: string

  @ApiProperty({example: '3'})
  rank: number
}

