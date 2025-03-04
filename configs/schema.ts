import { integer, json, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    credits: integer().default(0)
});

export const generateCodeTable = pgTable("wireframe_code", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    uid: varchar().notNull(),
    imageURL: varchar().notNull(),
    model: varchar().notNull(),
    prompt: varchar(),
    code: json(),
    createdBy: varchar().notNull(),
})