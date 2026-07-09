export type TimeSlot = {
  date: string;
  time: string;
  available: boolean;
};

export type WorkingHourRecord = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type AbsenceRecord = {
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

export type ManagedSlot = {
  date: string;
  time: string;
  status: "available" | "booked" | "blocked" | "absent";
};

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
