import { ApiProperty } from '@nestjs/swagger';

export class ConnexionDto {
  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  password: string;
}
