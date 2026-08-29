import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";
import { findOrCreateExercise } from "@/data/exercises";

type CreateWorkoutSetInput = {
  reps: number | null;
  weight: string | null;
  weightUnit: "lb" | "kg";
  setType: "warmup" | "working" | "dropset" | "failure";
};

type CreateWorkoutExerciseInput = {
  name: string;
  notes: string | null;
  sets: CreateWorkoutSetInput[];
};

type CreateWorkoutInput = {
  name: string | null;
  performedAt: Date;
  exercises: CreateWorkoutExerciseInput[];
};

export async function createWorkout(userId: string, input: CreateWorkoutInput) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name,
      performedAt: input.performedAt,
    })
    .returning();

  for (const [exerciseIndex, exerciseInput] of input.exercises.entries()) {
    const exercise = await findOrCreateExercise(exerciseInput.name);

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({
        workoutId: workout.id,
        exerciseId: exercise.id,
        order: exerciseIndex,
        notes: exerciseInput.notes,
      })
      .returning();

    if (exerciseInput.sets.length > 0) {
      await db.insert(sets).values(
        exerciseInput.sets.map((set, setIndex) => ({
          workoutExerciseId: workoutExercise.id,
          setNumber: setIndex + 1,
          weight: set.weight,
          weightUnit: set.weightUnit,
          reps: set.reps,
          setType: set.setType,
        })),
      );
    }
  }

  return workout;
}

export async function getWorkoutsForDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setDate(startOfNextDay.getDate() + 1);

  const rows = await db
    .select({
      workout: workouts,
      workoutExercise: workoutExercises,
      exercise: exercises,
      set: sets,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.performedAt, startOfDay),
        lt(workouts.performedAt, startOfNextDay),
      ),
    )
    .orderBy(workouts.performedAt, workoutExercises.order, sets.setNumber);

  const workoutMap = new Map<
    string,
    typeof workouts.$inferSelect & {
      exercises: Map<
        string,
        typeof workoutExercises.$inferSelect & {
          exercise: typeof exercises.$inferSelect | null;
          sets: (typeof sets.$inferSelect)[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workout.id)) {
      workoutMap.set(row.workout.id, { ...row.workout, exercises: new Map() });
    }
    const workout = workoutMap.get(row.workout.id)!;

    if (row.workoutExercise) {
      if (!workout.exercises.has(row.workoutExercise.id)) {
        workout.exercises.set(row.workoutExercise.id, {
          ...row.workoutExercise,
          exercise: row.exercise,
          sets: [],
        });
      }
      const workoutExercise = workout.exercises.get(row.workoutExercise.id)!;

      if (row.set) {
        workoutExercise.sets.push(row.set);
      }
    }
  }

  return Array.from(workoutMap.values()).map((workout) => ({
    ...workout,
    exercises: Array.from(workout.exercises.values()),
  }));
}
