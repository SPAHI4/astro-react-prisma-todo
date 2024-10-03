import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';

import { TaskFilter, TaskPriority } from '../domain/Task.ts';
import { prisma } from '../lib/prisma.ts';
import { type Task, TaskSchema } from '../dto/Task.ts';

const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, 100));

export const task = {
  createEmpty: defineAction({
    accept: 'form',
    handler: async () => {
      await simulateLatency();
      return prisma.task.create({
        data: {
          title: '',
        },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
        },
      });
    },
  }),
  create: defineAction({
    accept: 'form',
    input: TaskSchema,
    handler: async ({ title, description, completed, dueDate, priority }): Promise<Task> => {
      await simulateLatency();
      return prisma.task.create({
        data: {
          title,
          description,
          completed,
          dueDate,
          priority,
        },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
        },
      });
    },
  }),
  update: defineAction({
    accept: 'form',
    input: TaskSchema.extend({
      id: z.number(),
    }),
    handler: async ({ id, title, description, completed, dueDate, priority }): Promise<Task> => {
      await simulateLatency();
      const task = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          completed,
          dueDate,
          priority,
        },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
        },
      });

      if (!task) {
        throw new ActionError({
          message: 'Task not found',
          code: 'NOT_FOUND',
        });
      }

      return task;
    },
  }),
  delete: defineAction({
    accept: 'form',
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      await simulateLatency();
      await prisma.task.delete({
        where: { id },
      });

      return { id };
    },
  }),

  findMany: defineAction({
    accept: 'json',
    input: z.object({
      filter: z.nativeEnum(TaskFilter).default(TaskFilter.ALL),
    }),
    handler: async ({ filter }): Promise<Task[]> => {
      await simulateLatency();
      const filterMap: Record<TaskFilter, Partial<Task>> = {
        all: {},
        active: { completed: false },
        completed: { completed: true },
        low: { priority: TaskPriority.LOW },
        medium: { priority: TaskPriority.MEDIUM },
        high: { priority: TaskPriority.HIGH },
      };

      return prisma.task.findMany({
        where: filterMap[filter],
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
        },
      });
    },
  }),

  // just for pages/tasks-variation
  deleteAcceptJson: defineAction({
    accept: 'json',
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      await simulateLatency();
      await prisma.task.delete({
        where: { id },
      });

      return { id };
    },
  }),
};
