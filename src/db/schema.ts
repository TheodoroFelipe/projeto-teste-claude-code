import { doublePrecision, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { WeeklyPlan } from '../types/trainingPlan'

export const athletes = pgTable('athletes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sport: text('sport').notNull(),
  team: text('team').notNull().default(''),
  nationality: text('nationality').notNull().default(''),
  photoUrl: text('photo_url'),
  age: integer('age'),
  weeklyPlan: jsonb('weekly_plan').$type<WeeklyPlan>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  athleteId: uuid('athlete_id')
    .notNull()
    .references(() => athletes.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['athlete', 'coach'] }).notNull(),
})

export const evolutionEntries = pgTable('evolution_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  athleteId: uuid('athlete_id')
    .notNull()
    .references(() => athletes.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
  xpGained: integer('xp_gained').notNull(),
  note: text('note'),
})

export const bodyMeasurements = pgTable('body_measurements', {
  id: uuid('id').defaultRandom().primaryKey(),
  athleteId: uuid('athlete_id')
    .notNull()
    .references(() => athletes.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
  weightKg: doublePrecision('weight_kg'),
  heightCm: doublePrecision('height_cm'),
  age: integer('age'),
  armCm: doublePrecision('arm_cm'),
  thighCm: doublePrecision('thigh_cm'),
  waistCm: doublePrecision('waist_cm'),
  chestCm: doublePrecision('chest_cm'),
  beltCm: doublePrecision('belt_cm'),
  hipCm: doublePrecision('hip_cm'),
})

export const coachPlans = pgTable('coach_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  coachUserId: uuid('coach_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  weeklyPlan: jsonb('weekly_plan').$type<WeeklyPlan>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const planInvites = pgTable('plan_invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => coachPlans.id, { onDelete: 'cascade' }),
  athleteEmail: text('athlete_email').notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'declined'] }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const coachAthleteLinks = pgTable('coach_athlete_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  coachUserId: uuid('coach_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  athleteId: uuid('athlete_id')
    .notNull()
    .unique()
    .references(() => athletes.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id')
    .notNull()
    .references(() => coachPlans.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
