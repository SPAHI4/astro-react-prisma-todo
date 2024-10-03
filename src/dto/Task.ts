import { Prisma } from '@prisma/client';
import { z } from 'astro:schema';
import { TaskPriority } from '../domain/Task.ts';

export type Task = Prisma.TaskGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    completed: true;
    dueDate: true;
    priority: true;
  };
}>;

export const TaskSchema = z.object({
  title: z
    .string({
      message: 'Title is required',
    })
    .min(2)
    .max(100),
  description: z.string().nullable(),
  priority: z.preprocess((val) => Number.parseInt(String(val), 10), z.nativeEnum(TaskPriority)),
  dueDate: z.coerce.date().min(new Date(), 'Due date must be in the future').nullable(),
  completed: z.boolean(),
});
