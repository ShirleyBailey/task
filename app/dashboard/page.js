"use client";

import { useEffect, useState } from "react";

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    /* ---------------- LOAD ---------------- */

    useEffect(() => {
        const storedTasks = localStorage.getItem("tasks");

        if (storedTasks) {
            try {
                const parsed = JSON.parse(storedTasks);

                if (Array.isArray(parsed)) {
                    setTasks(parsed);
                } else {
                    localStorage.removeItem("tasks"); // corrupted data cleanup
                }
            } catch {
                localStorage.removeItem("tasks");
            }
        }
    }, []);

    /* ---------------- SAVE ---------------- */

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    /* ---------------- TASK ACTIONS ---------------- */

    const addTask = () => {
        if (!title.trim()) return;

        const newTask = {
            id: crypto.randomUUID(),
            title: title,
            dueDate: dueDate,
            priority: priority,
            completed: false
        }

        setTasks(prev => [...prev, newTask]);
        setTitle("");
        setDueDate("");
    };

    const toggleTask = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const saveEdit = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, title: editingTitle }
                    : task
            )
        );

        setEditingId(null);
        setEditingTitle("");
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    const isOverdue = (task) => {
        if (!task.dueDate) return false;

        const today = new Date();
        const due = new Date(task.dueDate);

        return due < today && !task.completed;
    };

    /* ---------------- FILTER ---------------- */

    const filteredTasks = tasks.filter(task => {
        if (priorityFilter !== "all" && task.priority !== priorityFilter)
            return false;

        if (statusFilter === "active" && task.completed) return false;
        if (statusFilter === "completed" && !task.completed) return false;


        return true;
    });


    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;

    const progress = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);
    /* ---------------- UI ---------------- */

    return (
        <div className="p-10 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="flex gap-2 mb-4">
                <input
                    className="border px-3 py-2 rounded w-full"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    type="date"
                    className="border px-3 py-2 rounded"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />

                <select
                    className="border px-3 py-2 rounded"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <button
                    onClick={addTask}
                    className="bg-black text-white px-4 rounded"
                >
                    Add
                </button>
            </div>

            <div className="flex gap-2 mb-4">
                {["all", "high", "medium", "low"].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className={`px-3 py-1 rounded border ${priorityFilter === p ? "bg-black text-white" : ""}`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 mb-6">
                {["all", "active", "completed"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded border ${statusFilter === s ? "bg-black text-white" : ""}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="border rounded p-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span>Total: {totalTasks}</span>
                    <span>Active: {activeTasks}</span>
                    <span>Done: {completedTasks}</span>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                        className="bg-black h-2 rounded transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="text-xs text-gray-500 mt-1">
                    Progress: {progress}%
                </div>
            </div>

            <div className="space-y-2">
                {filteredTasks.length === 0 && (
                    <p className="text-gray-400">No tasks found</p>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        className={`border p-3 rounded ${isOverdue(task) ? "border-red-500 bg-red-50" : ""
                            }`}
                    >

                        {editingId === task.id ? (
                            <input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                        ) : (
                            <>
                                <div className="font-medium">{task.title}</div>

                                {task.dueDate && (
                                    <div className="text-sm text-gray-400">
                                        Due: {task.dueDate}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-2 mt-2">
                            <div className="flex items-center gap-3">

                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center
        ${task.completed ? "bg-black text-white border-black" : "border-gray-400"}`}
                                >
                                    {task.completed && "✓"}
                                </button>

                                {editingId === task.id ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <div
                                        className={`font-medium transition-all
            ${task.completed ? "line-through text-gray-400" : ""}`}
                                    >
                                        {task.title}
                                    </div>
                                )}
                            </div>

                            {editingId === task.id ? (
                                <>
                                    <button onClick={() => saveEdit(task.id)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(task)}>Edit</button>
                                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                                </>
                            )}
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}