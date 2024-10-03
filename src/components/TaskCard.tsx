import React, { useActionState, useRef, useEffect } from 'react';
import { navigate } from 'astro:transitions/client';
import { actions, isInputError } from 'astro:actions';
import { experimental_withState as withState } from '@astrojs/react/actions';

import { TaskPriority } from '../domain/Task.ts';
import type { Task } from '../dto/Task.ts';
import { clsx, utcToLocal } from '../lib/utils.ts';
import { useNonNullableValue } from './hooks.ts';

import styles from './TaskCard.module.css';

interface Props {
  initialTask: Task;
  autoFocus?: boolean;
}

/**
 * Key concepts:
 * - Form submission with React 19 features
 * - Used defaultValue instead of value for input fields as:
 *   1) form actions work with formData
 *   2) it looks like it's the recommended behaviour now as it doesn't require to wait for the hydration to set the value and allows for progressive enhancement (not the case there)
 */
export const TaskCard: React.FC<Props> = ({ initialTask, autoFocus }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [{ data, error }, action, pending] = useActionState(withState(actions.task.update), {
    data: initialTask,
    error: undefined,
  });

  // data could be undefined in case of error
  // and I can't just use initialTask for defaultValues because <action> will reset the form even or error: https://github.com/facebook/react/issues/29034 even with controlled inputs!
  // so I could:
  // 1) use this hack, it will still reset the form on error but at least to the latest valid value, not the one that got from props first
  // 2) write a custom hook and do not use action and formAction props (But I've already spent way more time on this than expected)
  // 3) wait for some workaround from React/Astro team :)
  const [task, prevTask] = useNonNullableValue(data!);

  // Refresh the page if the task priority or completed status changed
  useEffect(() => {
    const filteredValueChanged = prevTask.priority !== task.priority || prevTask.completed !== task.completed;
    if (filteredValueChanged) {
      navigate('', {
        history: 'replace',
      });
    }
  }, [task, prevTask]);

  // Focus the title input on mount, autoFocus===true when the task is just created
  useEffect(() => {
    if (autoFocus) {
      titleRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show input errors and focus with reportValidity
  useEffect(() => {
    if (!isInputError(error)) {
      return;
    }
    const form = formRef.current!;

    for (const [key, value] of Object.entries(error.fields)) {
      const input = form.elements.namedItem(key) as HTMLInputElement;
      if (input) {
        input.setCustomValidity(value.join());
        input.reportValidity();
      }
    }
  }, [error]);

  const textInputsSharedProps = {
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      formRef.current?.requestSubmit();
      e.target.setCustomValidity('');
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.setCustomValidity('');
    },
  };

  return (
    <form action={action} ref={formRef} className="bg-white shadow-md rounded-md p-4 flex gap-3 relative">
      <input type="hidden" value={task.id} name="id" />
      <button type="submit" hidden />

      {pending && <div className={`absolute right-3 bottom-1 ${styles.loading}`} />}

      <input
        type="checkbox"
        defaultChecked={task.completed}
        className="form-checkbox h-8 w-8 text-blue-600 mt-1 cursor-pointer"
        name="completed"
        onChange={() => {
          formRef.current?.requestSubmit();
        }}
      />

      <div className="gap-1 flex flex-col grow">
        <input
          name="title"
          ref={titleRef}
          type="text"
          className={clsx('text-xl', task.completed && 'line-through')}
          defaultValue={task.title ?? ''}
          placeholder="Title"
          {...textInputsSharedProps}
        />

        <input
          name="description"
          className="text-md text-gray-600"
          defaultValue={task.description ?? ''}
          placeholder="Add description"
          {...textInputsSharedProps}
        />

        <div className="text-sm">
          Due at{' '}
          <input
            name="dueDate"
            type="datetime-local"
            placeholder="Due at"
            defaultValue={utcToLocal(task.dueDate)}
            {...textInputsSharedProps}
          />
        </div>
      </div>

      <div className="self-center">
        <select
          name="priority"
          key={task.priority}
          defaultValue={task.priority}
          className="text-lg"
          onChange={() => {
            formRef.current?.requestSubmit();
          }}
        >
          <option value={TaskPriority.LOW}>⚪️ Low</option>
          <option value={TaskPriority.MEDIUM}>🟠 Medium</option>
          <option value={TaskPriority.HIGH}>🔴 High</option>
        </select>
      </div>

      <div className="flex items-start gap-3">
        <button formAction={actions.task.delete.toString()} disabled={pending}>
          ❌
        </button>
      </div>
    </form>
  );
};
