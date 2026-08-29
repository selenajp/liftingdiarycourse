import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";

export async function findOrCreateExercise(name: string) {
  const trimmed = name.trim();

  const [existing] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.name, trimmed))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(exercises)
    .values({ name: trimmed })
    .returning();

  return created;
}
