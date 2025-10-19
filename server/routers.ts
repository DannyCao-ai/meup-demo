import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  onboarding: router({
    save: protectedProcedure
      .input(z.object({
        userName: z.string(),
        favoriteTopics: z.array(z.string()),
        selectedSkill: z.string(),
        learningTime: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveOnboarding({
          userId: ctx.user.id,
          userName: input.userName,
          favoriteTopics: input.favoriteTopics,
          selectedSkill: input.selectedSkill,
          learningTime: input.learningTime,
        });
        return { success: true };
      }),
    
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOnboarding(ctx.user.id);
    }),
  }),

  assessment: router({
    submit: protectedProcedure
      .input(z.object({
        skill: z.string(),
        assessmentType: z.string(),
        answers: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Calculate scores for each dimension
        const scores: Record<string, number> = {};
        const dimensions: Record<string, { correct: number; total: number }> = {};
        
        // This would normally involve comparing answers with correct answers
        // For demo purposes, we'll use AI to evaluate open-ended responses
        let totalScore = 0;
        let totalQuestions = Object.keys(input.answers).length;
        
        // Simple scoring logic (you can enhance this with actual answer checking)
        for (const [questionId, answer] of Object.entries(input.answers)) {
          // For now, give random scores between 60-100 for demo
          // In production, you'd check against correct answers
          const questionScore = Math.floor(Math.random() * 40) + 60;
          totalScore += questionScore;
        }
        
        // Calculate average
        const avgScore = Math.floor(totalScore / totalQuestions);
        
        // Distribute scores across dimensions (simplified)
        if (input.skill === "Active Listening") {
          scores["Paraphrasing"] = Math.floor(Math.random() * 30) + 70;
          scores["Understanding Priority"] = Math.floor(Math.random() * 30) + 70;
          scores["Summarizing"] = Math.floor(Math.random() * 30) + 70;
          scores["Checking for Understanding"] = Math.floor(Math.random() * 30) + 70;
          scores["Identifying Distortions"] = Math.floor(Math.random() * 30) + 70;
        } else if (input.skill === "Memory") {
          scores["Chunking Ability"] = Math.floor(Math.random() * 30) + 70;
          scores["Sequential Memory"] = Math.floor(Math.random() * 30) + 70;
          scores["Detail Retention"] = Math.floor(Math.random() * 30) + 70;
          scores["Technique Application"] = Math.floor(Math.random() * 30) + 70;
          scores["Critical Recall"] = Math.floor(Math.random() * 30) + 70;
        }
        
        await db.saveAssessment({
          userId: ctx.user.id,
          skill: input.skill,
          assessmentType: input.assessmentType,
          scores,
          totalScore: avgScore,
          answers: input.answers,
        });
        
        return { scores, totalScore: avgScore };
      }),
    
    getLatest: protectedProcedure
      .input(z.object({
        skill: z.string(),
        assessmentType: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getLatestAssessment(ctx.user.id, input.skill, input.assessmentType);
      }),
    
    evaluateOpenEnded: protectedProcedure
      .input(z.object({
        question: z.string(),
        userAnswer: z.string(),
        context: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Use LLM to evaluate open-ended responses
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert evaluator for upskilling assessments. Evaluate the user's answer based on the question and context. Provide a score from 0-100 and brief feedback."
            },
            {
              role: "user",
              content: `Question: ${input.question}\n\nContext: ${input.context}\n\nUser's Answer: ${input.userAnswer}\n\nProvide evaluation in JSON format: {"score": <number>, "feedback": "<string>"}`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "evaluation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: { type: "integer", description: "Score from 0 to 100" },
                  feedback: { type: "string", description: "Brief feedback on the answer" }
                },
                required: ["score", "feedback"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0].message.content;
        const result = JSON.parse(typeof content === 'string' ? content : "{}");
        return result;
      }),
  }),

  progress: router({
    save: protectedProcedure
      .input(z.object({
        skill: z.string(),
        lessonId: z.string(),
        keypointId: z.string(),
        status: z.enum(["required", "recommended", "optional", "completed"]),
        score: z.number().optional(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveLearningProgress({
          userId: ctx.user.id,
          skill: input.skill,
          lessonId: input.lessonId,
          keypointId: input.keypointId,
          status: input.status,
          score: input.score,
          completed: input.completed,
          lastAttemptAt: new Date(),
        });
        return { success: true };
      }),
    
    get: protectedProcedure
      .input(z.object({
        skill: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserLearningProgress(ctx.user.id, input.skill);
      }),
    
    updateFromAssessment: protectedProcedure
      .input(z.object({
        skill: z.string(),
        scores: z.record(z.string(), z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Update learning progress based on assessment scores
        // High scores (>=80) -> optional
        // Medium scores (60-79) -> recommended
        // Low scores (<60) -> required
        
        for (const [dimension, score] of Object.entries(input.scores)) {
          const numScore = typeof score === 'number' ? score : 0;
          let status: "required" | "recommended" | "optional" = "required";
          if (numScore >= 80) status = "optional";
          else if (numScore >= 60) status = "recommended";
          
          // Map dimensions to keypoints (simplified mapping)
          const keypointId = `${input.skill.toLowerCase().replace(/ /g, "_")}_kp_${dimension.toLowerCase().replace(/ /g, "_")}`;
          
          await db.saveLearningProgress({
            userId: ctx.user.id,
            skill: input.skill,
            lessonId: "auto_generated",
            keypointId,
            status,
            score: numScore,
            completed: false,
          });
        }
        
        return { success: true };
      }),
  }),

  exercise: router({
    saveAttempt: protectedProcedure
      .input(z.object({
        exerciseId: z.string(),
        attempt: z.number(),
        isCorrect: z.boolean(),
        userAnswer: z.any(),
        needsReview: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveExerciseAttempt({
          userId: ctx.user.id,
          exerciseId: input.exerciseId,
          attempt: input.attempt,
          isCorrect: input.isCorrect,
          userAnswer: input.userAnswer,
          needsReview: input.needsReview || false,
          nextReviewAt: input.needsReview ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
        });
        return { success: true };
      }),
    
    getAttempts: protectedProcedure
      .input(z.object({
        exerciseId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getExerciseAttempts(ctx.user.id, input.exerciseId);
      }),
    
    generateSimilar: protectedProcedure
      .input(z.object({
        originalQuestion: z.string(),
        exerciseType: z.string(),
        context: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Use LLM to generate a similar question
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert at creating educational exercises. Generate a similar question that tests the same concept but with different details."
            },
            {
              role: "user",
              content: `Original question: ${input.originalQuestion}\n\nExercise type: ${input.exerciseType}\n\nContext: ${input.context}\n\nGenerate a similar question in JSON format: {"question": "<string>", "options": ["<string>"], "correctAnswer": "<string>"}`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "similar_question",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctAnswer: { type: "string" }
                },
                required: ["question", "options", "correctAnswer"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0].message.content;
        const result = JSON.parse(typeof content === 'string' ? content : "{}");
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;

