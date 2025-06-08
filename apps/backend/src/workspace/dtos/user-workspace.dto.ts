import { Expose } from 'class-transformer';
import { WorkspaceDto } from './workspace.dto';

export class UserWorkspaceDto extends WorkspaceDto {
  @Expose()
  roleInWorkspace: string;
}
