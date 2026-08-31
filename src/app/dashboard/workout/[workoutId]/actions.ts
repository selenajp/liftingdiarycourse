"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
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

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().trim().min(1).nullable(),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(exerciseSchema).min(1),
});

type UpdateWorkoutActionInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutActionInput) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const parsed = updateWorkoutSchema.parse(input);

  const workout = await updateWorkout(userId, parsed.workoutId, {
    name: parsed.name,
    performedAt: parseDateParam(parsed.performedAt),
    exercises: parsed.exercises,
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  redirect(`/dashboard?date=${parsed.performedAt}`);
}
