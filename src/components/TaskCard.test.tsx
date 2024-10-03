import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { actions, ActionInputError } from 'astro:actions';
import { navigate } from 'astro:transitions/client';
import { TaskCard } from './TaskCard.tsx';
import type { Task } from '../dto/Task.ts';
import { TaskPriority } from '../domain/Task.ts';

vi.mock('astro:transitions/client', () => ({
  navigate: vi.fn(),
}));

vi.mock('astro:actions', async () => ({
  ...(await vi.importActual('astro:actions')),
  isInputError: (err: unknown) => err !== undefined,
  actions: {
    task: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const sampleTask: Task = {
  id: 1,
  title: 'Sample Task',
  description: 'This is a sample task.',
  dueDate: new Date('2024-10-02T17:37:14.150Z'),
  priority: TaskPriority.MEDIUM,
  completed: false,
};

describe('TaskCard Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(function (this: HTMLFormElement) {
      this.dispatchEvent(new Event('submit', { bubbles: true }));
    });
    vi.mocked(actions.task.update).mockResolvedValue({
      data: sampleTask,
      error: undefined,
    });
  });
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with initial task data', () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    const titleInput = screen.getByPlaceholderText('Title') as HTMLInputElement;
    expect(titleInput.value).toBe(sampleTask.title);

    const descriptionInput = screen.getByPlaceholderText('Add description') as HTMLInputElement;
    expect(descriptionInput.value).toBe(sampleTask.description);

    const dueDateInput = screen.getByPlaceholderText(/Due at/i) as HTMLInputElement;
    expect(dueDateInput.value).toBe('2024-10-02T21:37');

    const prioritySelect = screen.getByDisplayValue('🟠 Medium') as HTMLSelectElement;
    expect(prioritySelect.value).toBe(sampleTask.priority.toString());

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('auto-focuses the title input when autoFocus is true', () => {
    const screen = render(<TaskCard initialTask={sampleTask} autoFocus />);

    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).toHaveFocus();
  });

  it('does not auto-focus the title input when autoFocus is false', () => {
    const screen = render(<TaskCard initialTask={sampleTask} autoFocus={false} />);

    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).not.toHaveFocus();
  });

  it('submits the form when the title input loses focus', async () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    const titleInput = screen.getByPlaceholderText('Title');
    await userEvent.type(titleInput, 'Updated Task Title');

    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(actions.task.update).toHaveBeenCalled();
    });
  });

  it('submits the form when the description input loses focus', async () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    const descriptionInput = screen.getByPlaceholderText('Add description');
    await userEvent.type(descriptionInput, 'Updated Description');

    fireEvent.blur(descriptionInput);

    await waitFor(() => {
      expect(actions.task.update).toHaveBeenCalled();
    });
  });

  it('submits the form when the priority select changes', async () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    const prioritySelect = screen.getByRole('combobox') as HTMLSelectElement;
    await userEvent.selectOptions(prioritySelect, TaskPriority.HIGH.toString());

    await waitFor(() => {
      expect(actions.task.update).toHaveBeenCalled();
    });
  });

  it('submits the form when the completed checkbox is toggled', async () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(actions.task.update).toHaveBeenCalled();
    });
  });

  it('displays validation errors when form submission fails', async () => {
    vi.mocked(actions.task.update).mockResolvedValue({
      data: undefined,
      error: {
        fields: {
          title: ['Title is required.'],
        },
      } as ActionInputError<{
        title: string;
      }>,
    });

    const screen = render(<TaskCard initialTask={sampleTask} />);

    const titleInput = screen.getByPlaceholderText('Title');
    const fieldMock = vi.spyOn(titleInput as HTMLInputElement, 'setCustomValidity');
    await userEvent.clear(titleInput);

    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(actions.task.update).toHaveBeenCalled();
      expect(fieldMock).toHaveBeenCalledWith('Title is required.');
    });
  });

  it('navigates when task priority or completed status changes', async () => {
    const screen = render(<TaskCard initialTask={sampleTask} />);

    vi.mocked(actions.task.update).mockResolvedValue({
      data: {
        ...sampleTask,
        priority: TaskPriority.HIGH,
      },
      error: undefined,
    });

    const prioritySelect = screen.getByRole('combobox') as HTMLSelectElement;
    await userEvent.selectOptions(prioritySelect, TaskPriority.HIGH.toString());

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('', { history: 'replace' });
    });
  });
});
