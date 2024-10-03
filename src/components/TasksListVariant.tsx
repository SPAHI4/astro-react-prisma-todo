import React, { useCallback, useState } from 'react';
import { actions } from 'astro:actions';

import type { TaskFilter } from '../domain/Task.ts';
import type { Task } from '../dto/Task.ts';

interface Props {
  initialTasks: Task[];
  filter: TaskFilter;
}

// Just a snippet!, the actual implementation is in ./TaskCard.tsx

// a custom hook instead of useFormAction to 1) provide a Promise-based api 2) do not use formData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useAction = <TAction extends (...args: any[]) => Promise<any>>(action: TAction) => {
  const [state, setState] = useState({ data: null, error: null, pending: false });

  const callAction = useCallback(
    async (params: Parameters<TAction>[0]) => {
      setState({ ...state, pending: true });
      const { data, error } = await action(params);
      setState({ data, error, pending: false });

      if (error) {
        throw error;
      }

      return data;
    },
    [action, state],
  );

  return [callAction, state] as const;
};

/**
 * That's a skeleton how it could be implemented in a more traditional way
 */
export const TasksListVariant: React.FC<Props> = ({ initialTasks, filter }) => {
  const [findTasks, { pending: _findPending, data }] = useAction(actions.task.findMany);
  const [deleteTask, { pending: deletePending }] = useAction(actions.task.deleteAcceptJson);

  const handleDelete = async (id: number) => {
    await deleteTask({ id });
    await findTasks({
      filter,
    });

    // OR:
    // setTasks((tasks) => tasks.filter((t) => t.id !== id));
  };

  // const [updateTask, { pending: updatePending }] = useAction(actions.task.update);
  // const [createTask, { pending: createPending }] = useAction(actions.task.create);
  //
  // const handleUpdate = async (task: Task) => {
  //   const updated = await updateTask(task);
  //
  //   await findTasks({
  //     filter,
  //   });
  //   OR:
  //   setTasks((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
  // };
  //
  // const handleCreate = async (task: Task) => {
  //   const created = await createTask(task);
  //
  //   await findTasks({
  //     filter,
  //   });
  //  OR:
  //  setTasks((tasks) => [created, ...tasks]);
  // };

  const tasks = data ?? initialTasks;

  return (
    <>
      {/*{showCreateForm && <TaskCardVariant onSubmit={handleCreate} pending={createPending} />}*/}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.description}{' '}
            <button onClick={() => handleDelete(task.id)} disabled={deletePending}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
