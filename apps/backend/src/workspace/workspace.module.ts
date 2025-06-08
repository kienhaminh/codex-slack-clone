import { Module } from '@nestjs/common';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceController } from './controllers/workspace.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [AuthModule], // Add AuthModule here
  providers: [WorkspaceService],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
