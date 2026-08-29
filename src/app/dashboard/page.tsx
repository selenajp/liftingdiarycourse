import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkoutDatePicker } from "@/components/workout-date-picker";
import { getWorkoutsForDate } from "@/data/workouts";
import { parseDateParam } from "@/lib/date";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function formatOrdinalDate(date: Date) {
  return format(date, "do MMM yyyy").replace(/[A-Za-z]+/, (month) =>
    month.toLowerCase()
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { date } = await searchParams;
  const dateParam = date ?? format(new Date(), "yyyy-MM-dd");

  const workouts = await getWorkoutsForDate(userId, parseDateParam(dateParam));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Button render={<Link href="/dashboard/workout/new" />}>
            New workout
          </Button>
        </div>
        <WorkoutDatePicker dateParam={dateParam} />
      </div>

      <div className="flex flex-col gap-4">
        {workouts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No workouts logged</CardTitle>
              <CardDescription>
                Nothing logged for {formatOrdinalDate(parseDateParam(dateParam))}{" "}
                yet.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name ?? "Workout"}</CardTitle>
                <CardDescription>
                  {formatOrdinalDate(workout.performedAt)}
                </CardDescription>
                <CardAction>
                  <Badge variant="secondary">
                    {workout.exercises.length} exercises
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {workout.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex flex-col gap-2">
                    {index > 0 && <Separator className="mb-2" />}
                    <p className="font-medium">
                      {exercise.exercise?.name ?? "Exercise"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.sets.map((set, setIndex) => (
                        <Badge key={set.id} variant="outline">
                          Set {setIndex + 1}: {set.reps} x {set.weight}
                          {set.weightUnit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
