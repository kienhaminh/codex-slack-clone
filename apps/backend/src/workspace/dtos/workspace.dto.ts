import { Expose } from 'class-transformer';

export class WorkspaceDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  ownerId: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
