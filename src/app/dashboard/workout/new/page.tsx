import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewWorkoutForm } from "./workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">New workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
