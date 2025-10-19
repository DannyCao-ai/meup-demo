import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User onboarding data
 */
export const userOnboarding = mysqlTable("user_onboarding", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  favoriteTopics: json("favoriteTopics").$type<string[]>().notNull(), // Array of selected topics
  selectedSkill: varchar("selectedSkill", { length: 100 }).notNull(), // "Active Listening" or "Memory"
  learningTime: varchar("learningTime", { length: 50 }).notNull(), // e.g., "15 minutes/day"
  createdAt: timestamp("createdAt").defaultNow(),
});

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = typeof userOnboarding.$inferInsert;

/**
 * User assessment results from role-play
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  skill: varchar("skill", { length: 100 }).notNull(), // "Active Listening" or "Memory"
  assessmentType: varchar("assessmentType", { length: 50 }).notNull(), // "entrance", "scenario_branching"
  scores: json("scores").$type<Record<string, number>>().notNull(), // e.g., {"paraphrasing": 80, "understanding_priority": 60}
  totalScore: int("totalScore").notNull(),
  answers: json("answers").$type<Record<string, any>>().notNull(), // User's answers
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * User learning progress for each keypoint
 */
export const learningProgress = mysqlTable("learning_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  skill: varchar("skill", { length: 100 }).notNull(),
  lessonId: varchar("lessonId", { length: 100 }).notNull(),
  keypointId: varchar("keypointId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["required", "recommended", "optional", "completed"]).default("required").notNull(),
  score: int("score").default(0), // 0-100
  completed: boolean("completed").default(false),
  lastAttemptAt: timestamp("lastAttemptAt"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = typeof learningProgress.$inferInsert;

/**
 * Exercise attempts with spaced repetition tracking
 */
export const exerciseAttempts = mysqlTable("exercise_attempts", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  exerciseId: varchar("exerciseId", { length: 100 }).notNull(),
  attempt: int("attempt").default(1), // 1st try, 2nd try, etc.
  isCorrect: boolean("isCorrect").notNull(),
  userAnswer: json("userAnswer").$type<any>().notNull(),
  needsReview: boolean("needsReview").default(false), // For spaced repetition
  nextReviewAt: timestamp("nextReviewAt"), // When to show again
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = typeof exerciseAttempts.$inferInsert;

