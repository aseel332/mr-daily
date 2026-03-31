// lib/alfred/tools.ts

export const VAPI_WEBHOOK_URL = "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook";

export const getAlfredTools = () => [
  // CREATE EVENT
  {
    type: "function",
    function: {
      name: "create_event",
      description:
        "Create a calendar event for the user when they mention meetings, classes, deadlines, or reminders with a time.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          title: { type: "string" },
          startTime: { type: "string", description: "ISO string" },
          endTime: { type: "string", description: "ISO string" },
          location: { type: "string" },
          notes: { type: "string" },
          remindTime: { type: "string", description: "ISO string" },
          color: {
            type: "string",
            enum: ["blue", "cyan", "violet", "green", "amber", "rose", "red", "orange"],
            description: "Color label for the event on the calendar"
          },
          repeat: {
            type: "object",
            properties: {
              frequency: { type: "string", enum: ["daily", "weekly"] },
              daysOfWeek: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                },
              },
            },
          },
          repeatEnd: { type: "string", description: "ISO string (The date the recurrence should end)" },
        },
        required: ["userId", "title", "startTime", "endTime"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // CREATE TODO
  {
    type: "function",
    function: {
      name: "create_todo",
      description:
        "Create a todo/task for the user when they mention something to do, even if no exact time is given.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          task: { type: "string" },
          dueTime: { type: "string", description: "ISO string or null" },
          priority: {
            type: "string",
            enum: ["low", "normal", "high"],
          },
          remindTime: { type: "string", description: "ISO string" },
          repeat: {
            type: "object",
            properties: {
              frequency: { type: "string", enum: ["daily", "weekly"] },
              daysOfWeek: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                },
              },
            },
          },
          repeatEnd: { type: "string", description: "ISO string" },
        },
        required: ["userId", "task"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // EDIT EVENT
  {
    type: "function",
    function: {
      name: "edit_event",
      description:
        "Edit an existing calendar event ONLY EVENTS NOT TODOS. Provide the event name and using that get the id from the schedule and fields to update.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          eventId: { type: "string" },
          title: { type: "string" },
          startTime: { type: "string", description: "ISO string" },
          endTime: { type: "string", description: "ISO string" },
          location: { type: "string" },
          notes: { type: "string" },
          color: {
            type: "string",
            enum: ["blue", "cyan", "violet", "green", "amber", "rose", "red", "orange"],
            description: "Color label for the event on the calendar"
          },
          repeat: {
            type: "object",
            properties: {
              frequency: { type: "string", enum: ["daily", "weekly"] },
              daysOfWeek: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                },
              },
            },
          },
          repeatEnd: { type: "string", description: "ISO string" },
        },
        required: ["userId", "eventId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // EDIT TODO
  {
    type: "function",
    function: {
      name: "edit_todo",
      description:
        "Edit an existing todo ONLY TODOS NOT EVENTS. Provide the task name to resolve the id from the schedule and fields to update.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          todoId: { type: "string" },
          task: { type: "string" },
          dueTime: { type: "string", description: "ISO string" },
          notes: { type: "string" },
          priority: {
            type: "string",
            enum: ["low", "normal", "high"],
          },
          repeat: {
            type: "object",
            properties: {
              frequency: { type: "string", enum: ["daily", "weekly"] },
              daysOfWeek: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                },
              },
            },
          },
          repeatEnd: { type: "string", description: "ISO string" },
        },
        required: ["userId", "todoId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // COMPLETE EVENT
  {
    type: "function",
    function: {
      name: "complete_event",
      description: "Mark an event ONLY EVENTS NOT TODOS as completed by its ID.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          eventId: { type: "string" },
        },
        required: ["userId", "eventId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // DELETE EVENT
  {
    type: "function",
    function: {
      name: "delete_event",
      description: "Delete an event document ONLY EVENTS NOT TODOS permanently using its ID.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          eventId: { type: "string" },
        },
        required: ["userId", "eventId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // COMPLETE TODO
  {
    type: "function",
    function: {
      name: "complete_todo",
      description: "Mark a todo ONLY TODOS NOT EVENTS as completed by its ID.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          todoId: { type: "string" },
        },
        required: ["userId", "todoId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },

  // DELETE TODO
  {
    type: "function",
    function: {
      name: "delete_todo",
      description: "Delete a todo ONLY TODOS NOT EVENTS permanently using its ID.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string" },
          todoId: { type: "string" },
        },
        required: ["userId", "todoId"],
      },
    },
    server: {
      url: VAPI_WEBHOOK_URL,
    },
  },
] as const;

