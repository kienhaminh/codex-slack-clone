import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100) // Example length
  name: string;
}
