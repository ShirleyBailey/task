"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableItem({ task, toggleTask, deleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 flex justify-between items-center shadow-sm bg-white"
    >
      <div
        className="flex items-center gap-3 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <button
          onClick={() => toggleTask(task)}
          className={`w-5 h-5 rounded border flex items-center justify-center
            ${task.completed ? "bg-black text-white" : ""}
          `}
        >
          {task.completed && "✓"}
        </button>

        <span
          className={`${
            task.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </span>
      </div>

      <button
        onClick={() => deleteTask(task)}
        className="text-sm text-red-500"
      >
        Delete
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();

    const sorted = data.sort((a, b) => a.order - b.order);
    setTasks(sorted);
  };

  const addTask = async () => {
    if (!title) return;

    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    setTitle("");
    loadTasks();
  };

  const toggleTask = async (task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
    });

    loadTasks();
  };

  const deleteTask = async (task) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "DELETE",
    });

    loadTasks();
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
      .map((task, index) => ({
        ...task,
        order: index + 1,
      }));

    setTasks(newTasks);

    await fetch("/api/tasks/reorder", {
      method: "POST",
      body: JSON.stringify({ tasks: newTasks }),
    });
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Task Dashboard 😏🔥
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border px-4 py-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
        />
        <button
          onClick={addTask}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map(task => (
              <SortableItem
                key={task.id}
                task={task}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}