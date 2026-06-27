'use client';

import { useState, useRef } from 'react';
import { Activity, Play, Loader2 } from 'lucide-react';

export default function OpsTaskBoard({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [triggering, setTriggering] = useState(false);
  const intervalsRef = useRef({});

  const persistProgress = async (taskId, progress, status) => {
    try {
      await fetch('/api/operations/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, progress, status }),
      });
    } catch (err) {
      console.error('Failed to persist task progress:', err);
    }
  };

  const handleTriggerTask = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/operations/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Partition Health Integrity Check', node: 'node-us-east-1a' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger task.');

      const newTask = data.task;
      setTasks((prev) => [newTask, ...prev]);

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        const status = currentProgress >= 100 ? 'Completed' : 'Running';
        setTasks((prev) =>
          prev.map((t) => (t.id === newTask.id ? { ...t, progress: currentProgress, status } : t))
        );
        persistProgress(newTask.id, currentProgress, status);
        if (currentProgress >= 100) {
          clearInterval(interval);
          delete intervalsRef.current[newTask.id];
        }
      }, 800);
      intervalsRef.current[newTask.id] = interval;
    } catch (err) {
      alert(err.message);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="p-8 rounded-[12px] border border-dashed border-cork-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-[18px] font-medium flex items-center gap-2">
          <Activity className="w-5 h-5 text-burnt-sienna" />
          Background Tasks Queue Manager
        </h2>
        <button
          onClick={handleTriggerTask}
          disabled={triggering}
          className="px-5 py-2 text-xs font-semibold bg-dark-cork text-warm-cream border border-transparent hover:border-warm-cream rounded-[22.5px] transition-all duration-300 cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {triggering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-burnt-sienna" />}
          Trigger Systems Backup
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-cork-shadow text-xs font-semibold uppercase tracking-wider text-grey-brown">
              <th className="py-3 px-4">System Task</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Cluster Node</th>
              <th className="py-3 px-4">Task Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cork-shadow/40 text-sm">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-warm-cream/[0.02] transition-colors">
                <td className="py-4 px-4 text-warm-cream font-medium">{task.name}</td>
                <td className="py-4 px-4 w-48">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-grey-brown w-8">{task.progress}%</span>
                    <div className="flex-1 h-1.5 bg-cork-shadow/30 border border-cork-shadow rounded-full overflow-hidden">
                      <div
                        className="h-full bg-burnt-sienna transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-grey-brown font-mono text-xs">{task.node}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    task.status === 'Completed'
                      ? 'bg-burnt-sienna/10 border-burnt-sienna/30 text-burnt-sienna'
                      : task.status === 'Running'
                      ? 'bg-warm-cream/10 border-warm-cream/30 text-warm-cream animate-pulse'
                      : 'bg-transparent border-cork-shadow text-grey-brown'
                  }`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-grey-brown text-sm">
                  No tasks yet. Trigger a backup to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
