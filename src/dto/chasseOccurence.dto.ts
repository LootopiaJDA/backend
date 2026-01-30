import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ChasseDto } from "./chasse.dto";

export class OccurenceDto {
    @IsNotEmpty()
    @IsInt()
    chasse_id: number;

    @IsDateString()
    date_end: Date;

    @IsDateString()
    date_start: Date;

    @IsNotEmpty()
    @IsInt()
    limit_user: number;
}

export class ChasseOccurrenceDto extends ChasseDto {
    @ApiProperty({
        example: '{"description":"Description","date_start":"2025-01-30T10:00:00Z","date_end":"2025-01-30T10:00:00Z","limit_user":10}'
    })
    occurrence: string; 
}