import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class InviteUserDto {
  // User can be invited by email or existing userId
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  @IsOptional()
  @MinLength(3) // Example: 'admin', 'member'
  role?: string = 'member'; // Default role
}
