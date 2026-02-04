// app/api/vapi/web-assistant/route.ts
import { NextResponse } from "next/server";
import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";

export async function POST(req: Request) {
  const body = await req.json();

  const userContext = {
    userId: body.clerkId,
    name: body.name.split(" ")[0],
    callReason: "intro" as const,
  };

  const systemPrompt = await buildAlfredSystemPrompt({
    name: userContext.name,
    userId: userContext.userId,
    callReason: userContext.callReason,
  });

  return NextResponse.json({
    success: true,
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.5,
        messages: [{ role: "system", content: systemPrompt }],
        tools: [
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
                  repeatStart: { type: "string", description: "ISO string" },
                  repeatEnd: { type: "string", description: "ISO string" },
                },
                required: ["userId", "title", "startTime", "endTime"],
              },
            },
            server: {
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
                },
                required: ["userId", "task"],
              },
            },
            server: {
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
                  startTime: { type: "string" },
                  endTime: { type: "string" },
                  location: { type: "string" },
                  notes: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["userId", "eventId"],
              },
            },
            server: {
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
        deadline: { type: "string" },
        notes: { type: "string" },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
        },
      },
      required: ["userId", "todoId"],
    },
  },
  server: {
    url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
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
    url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
  },
},
// DELETE TODO
{
  type: "function",
  function: {
    name: "delete_todo",
    description: "Delete a todo ONLY TODOS NOT EVENTS  permanently using its ID.",
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
    url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
  },
},

        ],
      },

      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },

      firstMessage: `Hey ${userContext.name}, it’s Alfred. How can I help you today?`,
    },
  });
}
