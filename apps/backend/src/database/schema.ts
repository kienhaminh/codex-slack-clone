/* istanbul ignore file */
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  uuid,
  index,
  unique, // Changed from uniqueConstraint to unique
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  googleId: varchar('google_id', { length: 255 }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: integer('owner_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: serial('id').primaryKey(),
    workspaceId: integer('workspace_id')
      .references(() => workspaces.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    role: varchar('role', { length: 50 }).notNull(), // e.g., 'admin', 'member'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    workspaceUserUnique: unique( // Changed from uniqueConstraint to unique
      'workspace_members_workspace_id_user_id_key',
    ).on(table.workspaceId, table.userId),
    workspaceIdx: index('workspace_members_workspace_id_idx').on(
      table.workspaceId,
    ),
    userIdx: index('workspace_members_user_id_idx').on(table.userId),
  }),
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('sessions_user_id_idx').on(table.userId),
  }),
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('password_reset_user_id_idx').on(table.userId),
  }),
);
