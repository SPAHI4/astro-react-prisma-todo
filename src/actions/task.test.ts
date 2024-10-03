import { describe, it, expect, vi, beforeEach } from 'vitest';
import { task } from './task';
import { prisma } from '../lib/prisma';
import { TaskFilter, TaskPriority } from '../domain/Task';
import { Prisma } from '@prisma/client';
import { ActionError } from 'astro:actions';

vi.mock('../lib/prisma', () => ({
  prisma: {
    task: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const select = { id: true, title: true, description: true, completed: true, dueDate: true, priority: true };
const mockTask: Prisma.TaskGetPayload<object> = {
  id: 1,
  title: 'Task 1',
  completed: false,
  priority: TaskPriority.LOW,
  description: '',
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Task Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEmpty', () => {
    it('should create an empty task', async () => {
      vi.mocked(prisma.task.create).mockResolvedValue(mockTask);
      const result = await task.createEmpty(new FormData());

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { title: '' },
        select,
      });
      expect(result).toEqual({
        data: mockTask,
        error: undefined,
      });
    });
  });

  describe('create', () => {
    it('should create a task with provided data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        completed: false,
        dueDate: new Date(),
        priority: TaskPriority.MEDIUM,
      };
      vi.mocked(prisma.task.create).mockResolvedValue({ ...mockTask, ...taskData });

      const formData = new FormData();
      Object.entries(taskData).forEach(([key, value]) => {
        formData.append(key, value instanceof Date ? value.toISOString() : value.toString());
      });

      const result = await task.create(formData);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: taskData,
        select,
      });
      expect(result).toEqual({
        data: { ...mockTask, ...taskData },
        error: undefined,
      });
    });
  });

  describe('update', () => {
    const id = 1;
    const taskData = {
      title: 'Updated Task',
      description: 'Updated description',
      completed: true,
      dueDate: new Date(),
      priority: TaskPriority.HIGH,
    };

    const formData = new FormData();
    Object.entries(taskData).forEach(([key, value]) => {
      formData.append(key, value instanceof Date ? value.toISOString() : value.toString());
    });
    formData.append('id', id.toString());

    it('should update a task with provided data', async () => {
      vi.mocked(prisma.task.update).mockResolvedValue({ ...mockTask, ...taskData });

      const result = await task.update(formData);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id },
        data: taskData,
        select,
      });
      expect(result).toEqual({
        data: { ...mockTask, ...taskData },
        error: undefined,
      });
    });

    it('should throw an ActionError if task is not found', async () => {
      vi.mocked(prisma.task.update).mockResolvedValue(null as never);

      await expect(task.update(formData)).resolves.toEqual({
        data: undefined,
        error: new ActionError({ message: 'Task not found', code: 'NOT_FOUND' }),
      });
    });
  });

  describe('delete', () => {
    it('should delete a task with provided id', async () => {
      vi.mocked(prisma.task.delete).mockResolvedValue(mockTask);

      const formData = new FormData();
      formData.append('id', '1');

      const result = await task.delete(formData);

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        data: { id: 1 },
        error: undefined,
      });
    });
  });

  describe('findMany', () => {
    it('should return all tasks when filter is ALL', async () => {
      vi.mocked(prisma.task.findMany).mockResolvedValue([mockTask]);

      const result = await task.findMany({ filter: TaskFilter.ALL });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        select,
      });
      expect(result).toEqual({
        data: [mockTask],
        error: undefined,
      });
    });

    it('should return active tasks when filter is ACTIVE', async () => {
      const activeTask = { ...mockTask, completed: false };
      vi.mocked(prisma.task.findMany).mockResolvedValue([activeTask]);

      const result = await task.findMany({ filter: TaskFilter.ACTIVE });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { completed: false },
        orderBy: { createdAt: 'desc' },
        select,
      });
      expect(result).toEqual({
        data: [activeTask],
        error: undefined,
      });
    });

    it('should return completed tasks when filter is COMPLETED', async () => {
      const completedTask = { ...mockTask, completed: true };
      vi.mocked(prisma.task.findMany).mockResolvedValue([completedTask]);

      const result = await task.findMany({ filter: TaskFilter.COMPLETED });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { completed: true },
        orderBy: { createdAt: 'desc' },
        select,
      });
      expect(result).toEqual({
        data: [completedTask],
        error: undefined,
      });
    });

    it('should return tasks with specific priority when filter is LOW, MEDIUM, or HIGH', async () => {
      const highPriorityTask = { ...mockTask, priority: TaskPriority.HIGH };
      vi.mocked(prisma.task.findMany).mockResolvedValue([highPriorityTask]);

      const result = await task.findMany({ filter: TaskFilter.HIGH });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { priority: TaskPriority.HIGH },
        orderBy: { createdAt: 'desc' },
        select,
      });
      expect(result).toEqual({
        data: [highPriorityTask],
        error: undefined,
      });
    });
  });

  describe('deleteAcceptJson', () => {
    it('should delete a task with provided id', async () => {
      vi.mocked(prisma.task.delete).mockResolvedValue(mockTask);

      const result = await task.deleteAcceptJson({ id: 1 });

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        data: { id: 1 },
        error: undefined,
      });
    });
  });
});
