import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("vybe_user_role", ["provider", "client"]);
export const providerPlanEnum = pgEnum("vybe_provider_plan", ["free", "pro", "elite"]);
export const bookingStatusEnum = pgEnum("vybe_booking_status", ["pending", "confirmed", "declined", "completed"]);

export const usersTable = pgTable("vybe_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const providersTable = pgTable("vybe_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  category: text("category").notNull(),
  avatarUrl: text("avatar_url"),
  instagramHandle: text("instagram_handle"),
  isVerified: boolean("is_verified").notNull().default(false),
  plan: providerPlanEnum("plan").notNull().default("free"),
});

export const clientsTable = pgTable("vybe_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
});

export const servicesTable = pgTable("vybe_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").notNull().default(true),
});

export const workingHoursTable = pgTable("vybe_working_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providersTable.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: text("open_time"),
  closeTime: text("close_time"),
  isClosed: boolean("is_closed").notNull().default(false),
});

export const bookingsTable = pgTable("vybe_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providersTable.id),
  clientId: uuid("client_id").notNull().references(() => clientsTable.id),
  serviceId: uuid("service_id").notNull().references(() => servicesTable.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  appointmentAt: timestamp("appointment_at", { withTimezone: true }).notNull(),
  inspoPhotoUrl: text("inspo_photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewsTable = pgTable("vybe_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookingsTable.id),
  providerId: uuid("provider_id").notNull().references(() => providersTable.id),
  clientId: uuid("client_id").notNull().references(() => clientsTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favoritesTable = pgTable("vybe_favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clientsTable.id),
  providerId: uuid("provider_id").notNull().references(() => providersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
