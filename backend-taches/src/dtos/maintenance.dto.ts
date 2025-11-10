// src/dto/maintenance.dto.ts
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Priorite, StatutMaintenance } from "@prisma/client";

export class CreateMaintenanceDto {
  @IsInt()
  materielId!: number;

  @IsInt()
  technicienId!: number;

  @IsString()
  @MinLength(5)
  description!: string;

  @IsDateString()
  dateDebut!: string;

  @IsEnum(Priorite)
  @IsOptional()
  priorite?: Priorite;

  @IsEnum(StatutMaintenance)
  @IsOptional()
  statut?: StatutMaintenance;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsInt()
  materielId?: number;

  @IsOptional()
  @IsInt()
  technicienId?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsEnum(StatutMaintenance)
  statut?: StatutMaintenance;

  @IsOptional()
  @IsEnum(Priorite)
  priorite?: Priorite;
}
