"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createWorkoutAction } from "./actions";

function formatOrdinalDate(date: Date) {
  return format(date, "do MMM yyyy").replace(/[A-Za-z]+/, (month) =>
    month.toLowerCase()
  );
}

type WeightUnit = "lb" | "kg";
type SetType = "warmup" | "working" | "dropset" | "failure";

type SetForm = {
  reps: string;
  weight: string;
  weightUnit: WeightUnit;
  setType: SetType;
};

type ExerciseForm = {
  name: string;
  sets: SetForm[];
};

function emptySet(): SetForm {
  return { reps: "", weight: "", weightUnit: "lb", setType: "working" };
}

function emptyExercise(): ExerciseForm {
  return { name: "", sets: [emptySet()] };
}

export function NewWorkoutForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [performedAt, setPerformedAt] = useState(new Date());
  const [exercises, setExercises] = useState<ExerciseForm[]>([emptyExercise()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, update: Partial<ExerciseForm>) {
    setExercises((prev) =>
      prev.map((exercise, i) => (i === index ? { ...exercise, ...update } : exercise))
    );
  }

  function updateSet(exerciseIndex: number, setIndex: number, update: Partial<SetForm>) {
    setExercises((prev) =>
      prev.map((exercise, i) => {
        if (i !== exerciseIndex) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, j) => (j === setIndex ? { ...set, ...update } : set)),
        };
      })
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex ? { ...exercise, sets: [...exercise.sets, emptySet()] } : exercise
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === exerciseIndex
          ? { ...exercise, sets: exercise.sets.filter((_, j) => j !== setIndex) }
          : exercise
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createWorkoutAction({
        name: name.trim() || null,
        performedAt: format(performedAt, "yyyy-MM-dd"),
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          notes: null,
          sets: exercise.sets.map((set) => ({
            reps: set.reps === "" ? null : Number(set.reps),
            weight: set.weight === "" ? null : set.weight,
            weightUnit: set.weightUnit,
            setType: set.setType,
          })),
        })),
      });
    } catch {
      setError("Could not save the workout. Check the form and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="workout-name">Name</Label>
        <Input
          id="workout-name"
          placeholder="e.g. Push day"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger
            render={
              <Button type="button" variant="outline" className="w-fit">
                <CalendarIcon />
                {formatOrdinalDate(performedAt)}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={performedAt}
              onSelect={(date) => date && setPerformedAt(date)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-4">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(event) =>
                    updateExercise(exerciseIndex, { name: event.target.value })
                  }
                  required
                />
                {exercises.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove exercise"
                    onClick={() => removeExercise(exerciseIndex)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex flex-col gap-2">
                  {setIndex > 0 && <Separator />}
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>Reps</Label>
                      <Input
                        id={`reps-${exerciseIndex}-${setIndex}`}
                        type="number"
                        min={0}
                        className="w-20"
                        value={set.reps}
                        onChange={(event) =>
                          updateSet(exerciseIndex, setIndex, { reps: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>Weight</Label>
                      <Input
                        id={`weight-${exerciseIndex}-${setIndex}`}
                        type="number"
                        min={0}
                        step="0.5"
                        className="w-24"
                        value={set.weight}
                        onChange={(event) =>
                          updateSet(exerciseIndex, setIndex, { weight: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>Unit</Label>
                      <Select
                        value={set.weightUnit}
                        onValueChange={(value) =>
                          updateSet(exerciseIndex, setIndex, {
                            weightUnit: value as WeightUnit,
                          })
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label>Type</Label>
                      <Select
                        value={set.setType}
                        onValueChange={(value) =>
                          updateSet(exerciseIndex, setIndex, { setType: value as SetType })
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warmup">Warmup</SelectItem>
                          <SelectItem value="working">Working</SelectItem>
                          <SelectItem value="dropset">Dropset</SelectItem>
                          <SelectItem value="failure">Failure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {exercise.sets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove set"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSet(exerciseIndex)}
              >
                <Plus /> Add set
              </Button>
            </CardContent>
          </Card>
        ))}
        <Button type="button" variant="outline" onClick={addExercise}>
          <Plus /> Add exercise
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save workout"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
