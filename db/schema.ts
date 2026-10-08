import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const responses=sqliteTable('responses',{id:text('id').primaryKey(),startedAt:text('started_at').notNull(),completedAt:text('completed_at').notNull(),attempts:text('attempts').notNull(),accepted:integer('accepted',{mode:'boolean'}).notNull(),chases:integer('chases').notNull()});
