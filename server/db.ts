import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userOnboarding, 
  InsertUserOnboarding,
  assessments,
  InsertAssessment,
  learningProgress,
  InsertLearningProgress,
  exerciseAttempts,
  InsertExerciseAttempt
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Onboarding
export async function saveOnboarding(data: InsertUserOnboarding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userOnboarding).values(data);
  return result;
}

export async function getUserOnboarding(userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userOnboarding).where(eq(userOnboarding.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Assessments
export async function saveAssessment(data: InsertAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(assessments).values(data);
  return result;
}

export async function getUserAssessments(userId: string, skill?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = skill 
    ? and(eq(assessments.userId, userId), eq(assessments.skill, skill))
    : eq(assessments.userId, userId);
  
  const result = await db.select().from(assessments).where(conditions);
  return result;
}

export async function getLatestAssessment(userId: string, skill: string, assessmentType: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(assessments)
    .where(
      and(
        eq(assessments.userId, userId),
        eq(assessments.skill, skill),
        eq(assessments.assessmentType, assessmentType)
      )
    )
    .orderBy(assessments.createdAt)
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// Learning Progress
export async function saveLearningProgress(data: InsertLearningProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if exists
  const existing = await db.select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.userId, data.userId),
        eq(learningProgress.skill, data.skill),
        eq(learningProgress.keypointId, data.keypointId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update
    await db.update(learningProgress)
      .set({
        status: data.status,
        score: data.score,
        completed: data.completed,
        lastAttemptAt: data.lastAttemptAt,
        updatedAt: new Date()
      })
      .where(eq(learningProgress.id, existing[0].id));
    return existing[0];
  } else {
    // Insert
    const result = await db.insert(learningProgress).values(data);
    return result;
  }
}

export async function getUserLearningProgress(userId: string, skill: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.userId, userId),
        eq(learningProgress.skill, skill)
      )
    );
  
  return result;
}

// Exercise Attempts
export async function saveExerciseAttempt(data: InsertExerciseAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(exerciseAttempts).values(data);
  return result;
}

export async function getExerciseAttempts(userId: string, exerciseId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(exerciseAttempts)
    .where(
      and(
        eq(exerciseAttempts.userId, userId),
        eq(exerciseAttempts.exerciseId, exerciseId)
      )
    )
    .orderBy(exerciseAttempts.createdAt);
  
  return result;
}

