"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { parseDateParam } from "@/lib/date";

const setSchema = z.object({
  reps: z.number().int().nonnegative().nullable(),
  weight: z.string().nullable(),
  weightUnit: z.enum(["lb", "kg"]),
  setType: z.enum(["warmup", "working", "dropset", "failure"]),
});

const exerciseSchema = z.object({
  name: z.string().trim().min(1),
  notes: z.string().nullable(),
  sets: z.array(setSchema).min(1),
});

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1).nullable(),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(exerciseSchema).min(1),
});

type CreateWorkoutActionInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutActionInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const parsed = createWorkoutSchema.parse(input);

  await createWorkout(userId, {
    name: parsed.name,
    performedAt: parseDateParam(parsed.performedAt),
    exercises: parsed.exercises,
  });

  redirect(`/dashboard?date=${parsed.performedAt}`);
}
