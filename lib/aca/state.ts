import { getDateKeyInTimeZone } from "@/lib/utils/time";

export type DeskState = {
  activeStep: number;
  checkIn: {
    feeling: string;
    body: string;
    need: string;
    promise: string;
  };
  notes: Record<string, string>;
  completedActions: string[];
};

export const DEFAULT_DESK_STATE: DeskState = {
  activeStep: 1,
  checkIn: {
    feeling: "",
    body: "",
    need: "",
    promise: ""
  },
  notes: {},
  completedActions: []
};

export function getTodayMeetingDateKey() {
  return getDateKeyInTimeZone("Europe/Budapest");
}

export function parseDeskState(input: {
  activeStep?: number | null;
  arrivalNote?: string | null;
  bodyNote?: string | null;
  needsNote?: string | null;
  dailyPromise?: string | null;
  notesJson?: string | null;
  completedActionsJson?: string | null;
} | null): DeskState {
  if (!input) {
    return DEFAULT_DESK_STATE;
  }

  let notes = DEFAULT_DESK_STATE.notes;
  let completedActions = DEFAULT_DESK_STATE.completedActions;

  try {
    const parsed = JSON.parse(input.notesJson ?? "{}") as Record<string, string>;
    notes = typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    notes = {};
  }

  try {
    const parsed = JSON.parse(input.completedActionsJson ?? "[]") as string[];
    completedActions = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    completedActions = [];
  }

  return {
    activeStep: input.activeStep && input.activeStep >= 1 && input.activeStep <= 12 ? input.activeStep : 1,
    checkIn: {
      feeling: input.arrivalNote ?? "",
      body: input.bodyNote ?? "",
      need: input.needsNote ?? "",
      promise: input.dailyPromise ?? ""
    },
    notes,
    completedActions
  };
}

export function serializeDeskState(deskState: DeskState) {
  return {
    activeStep: deskState.activeStep,
    arrivalNote: deskState.checkIn.feeling,
    bodyNote: deskState.checkIn.body,
    needsNote: deskState.checkIn.need,
    dailyPromise: deskState.checkIn.promise,
    notesJson: JSON.stringify(deskState.notes),
    completedActionsJson: JSON.stringify(deskState.completedActions)
  };
}

