
export type AlfredCallReason =
  | "intro"
  | "reminder"
  | "check-in";

export interface AlfredUserContext {
  userId: string;
  name: string;
  phoneNumber: string;
  timezone?: string;
  callReason: AlfredCallReason;
}
