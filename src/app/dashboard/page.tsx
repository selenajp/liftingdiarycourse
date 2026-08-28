import { format } from "date-fns";
import { WorkoutDatePicker } from "@/components/workout-date-picker";
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

function formatOrdinalDate(date: Date) {
  return format(date, "do MMM yyyy").replace(/[A-Za-z]+/, (month) =>
    month.toLowerCase()
  );
}

const mockWorkouts = [
  {
    id: "1",
    name: "Push Day",
    performedAt: new Date(),
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        sets: [
          { id: "s1", reps: 8, weight: 60 },
          { id: "s2", reps: 8, weight: 60 },
          { id: "s3", reps: 6, weight: 65 },
        ],
      },
      {
        id: "e2",
        name: "Overhead Press",
        sets: [
          { id: "s4", reps: 10, weight: 30 },
          { id: "s5", reps: 10, weight: 30 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Evening Accessories",
    performedAt: new Date(),
    exercises: [
      {
        id: "e3",
        name: "Tricep Pushdown",
        sets: [
          { id: "s6", reps: 12, weight: 20 },
          { id: "s7", reps: 12, weight: 20 },
        ],
      },
    ],
  },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dateParam = date ?? format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <WorkoutDatePicker dateParam={dateParam} />
      </div>

      <div className="flex flex-col gap-4">
        {mockWorkouts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No workouts logged</CardTitle>
              <CardDescription>
                Nothing logged for {formatOrdinalDate(new Date(dateParam))}{" "}
                yet.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          mockWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
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
                    <p className="font-medium">{exercise.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.sets.map((set, setIndex) => (
                        <Badge key={set.id} variant="outline">
                          Set {setIndex + 1}: {set.reps} x {set.weight}kg
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
