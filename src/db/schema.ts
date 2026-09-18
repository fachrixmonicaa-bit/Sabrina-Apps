import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pin: text("pin").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  urgensi: text("urgensi"),
  kesiapanModal: text("kesiapan_modal"),
  opsiEksekusi: text("opsi_eksekusi"),
  skemaBayar: text("skema_bayar"),
  komitmen: boolean("komitmen").default(false),
  catatan: text("catatan"),
  createdAt: timestamp("created_at").defaultNow(),
});
