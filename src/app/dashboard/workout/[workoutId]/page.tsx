import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Edit workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialValues={{
          name: workout.name ?? "",
          performedAt: workout.performedAt,
          exercises: workout.exercises.map((exercise) => ({
            name: exercise.exercise?.name ?? "",
            sets: exercise.sets.map((set) => ({
              reps: set.reps === null ? "" : String(set.reps),
              weight: set.weight === null ? "" : set.weight,
              weightUnit: set.weightUnit,
              setType: set.setType,
            })),
          })),
        }}
      />
    </div>
  );
}
