import { defineRelations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const weightUnitEnum = pgEnum("weight_unit", ["lb", "kg"]);
export const setTypeEnum = pgEnum("set_type", [
  "warmup",
  "working",
  "dropset",
  "failure",
]);

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  order: integer("order").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sets = pgTable("sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutExerciseId: uuid("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: numeric("weight"),
  weightUnit: weightUnitEnum("weight_unit").default("lb").notNull(),
  reps: integer("reps"),
  setType: setTypeEnum("set_type").default("working").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const schema = { exercises, workouts, workoutExercises, sets };

export const relations = defineRelations(schema, (r) => ({
  exercises: {
    workoutExercises: r.many.workoutExercises(),
  },
  workouts: {
    workoutExercises: r.many.workoutExercises(),
  },
  workoutExercises: {
    workout: r.one.workouts({
      from: r.workoutExercises.workoutId,
      to: r.workouts.id,
    }),
    exercise: r.one.exercises({
      from: r.workoutExercises.exerciseId,
      to: r.exercises.id,
    }),
    sets: r.many.sets(),
  },
  sets: {
    workoutExercise: r.one.workoutExercises({
      from: r.sets.workoutExerciseId,
      to: r.workoutExercises.id,
    }),
  },
}));
