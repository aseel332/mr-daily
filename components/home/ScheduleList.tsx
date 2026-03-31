import { CalendarEvent } from "@/types/calendarTypes";

interface ScheduleListProps {
  items: CalendarEvent[];
  onComplete: (item: CalendarEvent) => void;
  onDelete: (item: CalendarEvent) => void;
  loading: boolean;
}

export function ScheduleList({ onComplete, onDelete, loading }: ScheduleListProps) {
  // create dummy items for today using the normal events and todo types
  const items = [
    {
      "id": "evt_1",
      "type": "event",
      "title": "Morning Standup",
      "startTime": "2026-02-18T05:10:00.000Z",
      "endTime": "2026-02-18T05:25:00.000Z",
      "deadline": null,
      "durationMinutes": 15,
      "remindTime": "2026-02-18T05:05:00.000Z",
      "repeat": null,
      "repeatStart": null,
      "repeatEnd": null,
      "priority": "medium",
      "location": "Zoom",
      "notes": "Daily sync with team",
      "color": "blue",
      "isDeleted": false,
      "isDone": false
    },
    {
      "id": "evt_2",
      "type": "event",
      "title": "Gym Session",
      "startTime": "2026-02-18T12:30:00.000Z",
      "endTime": "2026-02-18T13:30:00.000Z",
      "deadline": null,
      "durationMinutes": 60,
      "remindTime": "2026-02-18T12:00:00.000Z",
      "repeat": {
        "frequency": "weekly",
        "daysOfWeek": ["Wed", "Sat"]
      },
      "repeatStart": "2026-02-01T00:00:00.000Z",
      "repeatEnd": "2026-04-01T00:00:00.000Z",
      "priority": "high",
      "location": "ARC Gym",
      "notes": "Upper body day",
      "color": "green",
      "isDeleted": false,
      "isDone": false
    },
    {
      "id": "evt_3",
      "type": "event",
      "title": "Dinner with Friends",
      "startTime": "2026-02-18T19:30:00.000Z",
      "endTime": "2026-02-18T21:00:00.000Z",
      "deadline": null,
      "durationMinutes": 90,
      "remindTime": "2026-02-18T19:00:00.000Z",
      "repeat": null,
      "repeatStart": null,
      "repeatEnd": null,
      "priority": "low",
      "location": "Downtown",
      "notes": "Try the new place",
      "color": "violet",
      "isDeleted": false,
      "isDone": false
    },
    {
      "id": "todo_1",
      "type": "todo",
      "title": "Submit ECS Assignment",
      "startTime": null,
      "endTime": null,
      "deadline": "2026-02-18T23:59:00.000Z",
      "durationMinutes": 45,
      "remindTime": "2026-02-18T22:30:00.000Z",
      "repeat": null,
      "repeatStart": null,
      "repeatEnd": null,
      "priority": "high",
      "location": null,
      "notes": "Upload to Canvas",
      "color": "red",
      "isDeleted": false,
      "isDone": false
    },
    {
      "id": "todo_2",
      "type": "todo",
      "title": "Drink 3L Water",
      "startTime": null,
      "endTime": null,
      "deadline": "2026-02-18T23:00:00.000Z",
      "durationMinutes": null,
      "remindTime": "2026-02-18T18:00:00.000Z",
      "repeat": {
        "frequency": "daily"
      },
      "repeatStart": "2026-02-01T00:00:00.000Z",
      "repeatEnd": null,
      "priority": "medium",
      "location": null,
      "notes": "Health habit",
      "color": "cyan",
      "isDeleted": false,
      "isDone": false
    }
  ]

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <div className="w-120">
          {/* create a grid with 2 columns, with first column with smaller width than the second column */}
          <div className="flex">
            <div className="w-1/4">
              <h1>{item.startTime}</h1>
            </div>
            <div className="w-3/4">
              <h1>{item.title}</h1>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}