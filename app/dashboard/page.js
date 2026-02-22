"use client";

import { useEffect, useState } from "react";

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [sortBy, setSortBy] = useState("newest");

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);



    const toggleDarkMode = () => setDarkMode(prev => !prev);

    /* Load tasks from localStorage */

    useEffect(() => {
        const storedTasks = localStorage.getItem("tasks");

        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }
    }, []);

    /* Persist tasks */

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [darkMode]);
    /* Task actions */

    const addTask = () => {
        if (!title.trim()) return;

        const newTask = {
            id: crypto.randomUUID(),
            title,
            dueDate,
            priority,
            completed: false,
            createdAt: Date.now(),
        };

        setTasks(prev => [...prev, newTask]);

        setTitle("");
        setDueDate("");
        setPriority("medium");
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

    /* Editing */

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const saveEdit = (id) => {
        if (!editingTitle.trim()) return;

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

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    /* Filtering */

    const filteredTasks = tasks.filter(task => {
        if (priorityFilter !== "all" && task.priority !== priorityFilter)
            return false;

        if (statusFilter === "active" && task.completed)
            return false;

        if (statusFilter === "completed" && !task.completed)
            return false;

        return true;
    });

    /* Sorting */

    const sortedTasks = [...filteredTasks].sort((a, b) => {

        /* Ensure completed tasks are always at the bottom */

        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        if (sortBy === "newest") {
            return b.createdAt - a.createdAt;
        }

        if (sortBy === "oldest") {
            return a.createdAt - b.createdAt;
        }

        if (sortBy === "priority") {
            const order = { high: 3, medium: 2, low: 1 };
            return order[b.priority] - order[a.priority];
        }

        if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return new Date(a.dueDate) - new Date(b.dueDate);
        }

        return 0;
    });

    return (
        <div className="p-10 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <button
                onClick={() => setDarkMode(prev => !prev)}
                className="mb-4 px-4 py-2 border rounded-lg"
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <div className="border p-4 rounded-xl mb-6 bg-white shadow-sm">
                <div className="flex justify-between text-sm">
                    <span>Total: {totalTasks}</span>
                    <span>Active: {activeTasks}</span>
                    <span>Completed: {completedTasks}</span>
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
            {/* Task input */}

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

            {/* Priority filter */}

            <div className="flex gap-2 mb-4">
                {["all", "high", "medium", "low"].map(p => (
                    <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className={`px-3 py-1 rounded border ${priorityFilter === p ? "bg-black text-white" : ""
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Status filter */}

            <div className="flex gap-2 mb-4">
                {["all", "active", "completed"].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded border ${statusFilter === s ? "bg-black text-white" : ""
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Sorting */}

            <div className="flex gap-2 mb-6">
                {["newest", "oldest", "priority", "dueDate"].map(s => (
                    <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1 rounded border ${sortBy === s ? "bg-black text-white" : ""
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Task list */}

            <div className="space-y-2">
                {sortedTasks.length === 0 && (
                    <p className="text-gray-400">No tasks found</p>
                )}

                {sortedTasks.map(task => (
                    <div
                        key={task.id}
                        className={`border p-4 rounded-xl transition-all hover:shadow-md ${task.completed ? "opacity-50" : "bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                            />

                            {editingId === task.id ? (
                                <input
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    className="border rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <div
                                    className={`font-medium text-lg ${task.completed ? "line-through text-gray-400" : ""
                                        }`}
                                >
                                    {task.title}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-2">
                            {task.dueDate && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    Due: {task.dueDate}
                                </span>
                            )}

                            <span
                                className={`px-2 py-1 text-xs rounded-full ${task.priority === "high"
                                    ? "bg-red-100 text-red-600"
                                    : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                            >
                                {task.priority}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-3">
                            {editingId === task.id ? (
                                <>
                                    <button className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50">
                                        Save
                                    </button>
                                    <button className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50">
                                        Edit
                                    </button>
                                    <button className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50">
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}