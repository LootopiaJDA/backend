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

  partenerId?: number | null;
}

export class UpdateUserDto{
  @ApiProperty({ example: 'john_doe', required: false })
  username?: string;

  @ApiProperty({ example: 'john@mail.com', required: false })
  email?: string;

  @ApiProperty({ example: 'StrongPassword123!', required: false })
  password?: string;
}
