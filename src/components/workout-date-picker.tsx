"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

function parseDateParam(dateParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WorkoutDatePicker({ dateParam }: { dateParam: string }) {
  const router = useRouter();
  const selected = parseDateParam(dateParam);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <CalendarIcon />
            {selected.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            router.push(`/dashboard?date=${formatDateParam(date)}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
