import { ApiProperty } from "@nestjs/swagger";
import { Statut } from "../generated/prisma/client";

class CreatePartenaireDto {
  @ApiProperty({ example: '123 Main St, Cityville', required: false })
  adresse?: string;

  @ApiProperty({ example: '+1234567890' })
  telephone: string;

  @ApiProperty({ example: '12345678901234' })
  siret: string;

  @ApiProperty({ example: 'Doe Enterprises' })
  company_name: string;

  @ApiProperty({ enum: Statut, example: Statut.VERIFICATION })
  statut: Statut;
}

export class CreateUserPartenairDto {
    
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  password: string;

  @ApiProperty({ type: () => CreatePartenaireDto })
  partenaire: CreatePartenaireDto;
}

