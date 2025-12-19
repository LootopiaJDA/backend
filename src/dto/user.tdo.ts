import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  password: string;

  @ApiProperty({
    enum: ['ADMIN', 'PARTENAIRE', 'JOUEUR'],
    example: 'JOUEUR',
  })
  role: 'ADMIN' | 'PARTENAIRE' | 'JOUEUR';
}
