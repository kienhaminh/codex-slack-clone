import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  UnauthorizedException, // Import UnauthorizedException
} from '@nestjs/common';
import { WorkspaceService } from '../services/workspace.service';
import { AuthGuard } from '../../auth/auth.guard'; // Import AuthGuard
import { CreateWorkspaceDto } from '../dtos/create-workspace.dto';
import { InviteUserDto } from '../dtos/invite-user.dto';
import { WorkspaceDto } from '../dtos/workspace.dto'; // For response type
import { UserWorkspaceDto } from '../dtos/user-workspace.dto'; // For response type

// TODO: Import and use a real AuthGuard
// import { AuthGuard } from '@nestjs/passport'; // or your custom AuthGuard

@Controller('workspaces')
@UseGuards(AuthGuard) // Apply AuthGuard to all routes in this controller
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Req() req: any,
  ): Promise<WorkspaceDto> {
    const userId = (req as any).userId; // userId is attached by AuthGuard
    if (!userId) {
      // This check is a safeguard; AuthGuard should throw if userId cannot be determined.
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(
      `Controller: createWorkspace called by user ${userId} with DTO:`,
      createWorkspaceDto,
    );
    return this.workspaceService.createWorkspace(createWorkspaceDto, userId);
  }

  @Post(':workspaceId/invitations')
  @HttpCode(HttpStatus.CREATED)
  async inviteUserToWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: any,
  ): Promise<any> {
    const invitingUserId = (req as any).userId; // userId is attached by AuthGuard
    if (!invitingUserId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(
      `Controller: inviteUserToWorkspace called for ws ${workspaceId} by user ${invitingUserId} with DTO:`,
      inviteUserDto,
    );
    return this.workspaceService.inviteUserToWorkspace(
      inviteUserDto,
      workspaceId,
      invitingUserId,
    );
  }

  @Get('me') // Route: GET /workspaces/me
  async listMyWorkspaces(@Req() req: any): Promise<UserWorkspaceDto[]> {
    const userId = (req as any).userId; // userId is attached by AuthGuard
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(`Controller: listMyWorkspaces called for user ${userId}`);
    return this.workspaceService.listWorkspacesForUser(userId);
  }

  @Post(':workspaceId/switch-active')
  async switchActiveWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: any,
  ): Promise<any> {
    const userId = (req as any).userId; // userId is attached by AuthGuard
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(
      `Controller: switchActiveWorkspace called for ws ${workspaceId} by user ${userId}`,
    );
    return this.workspaceService.switchActiveWorkspace(userId, workspaceId);
  }

  @Delete(':workspaceId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('userId', ParseIntPipe) userIdToRemove: number,
    @Req() req: any,
  ): Promise<void> {
    const requestingUserId = (req as any).userId; // userId is attached by AuthGuard
    if (!requestingUserId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(
      `Controller: removeUserFromWorkspace called for ws ${workspaceId}, user ${userIdToRemove}, by user ${requestingUserId}`,
    );
    return this.workspaceService.removeUserFromWorkspace(
      workspaceId,
      userIdToRemove,
      requestingUserId,
    );
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkspace(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Req() req: any,
  ): Promise<void> {
    const userId = (req as any).userId; // userId is attached by AuthGuard
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    console.log(
      `Controller: deleteWorkspace called for ws ${workspaceId} by user ${userId}`,
    );
    return this.workspaceService.deleteWorkspace(workspaceId, userId);
  }
}
