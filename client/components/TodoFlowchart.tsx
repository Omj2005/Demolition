import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import {
    Circle,
    Square,
    Diamond,
    Hexagon,
    Trash2,
    Save,
    Calendar,
    Clock,
    X,
} from "lucide-react";

interface TodoItem {
    id: string;
    text: string;
    shape: "circle" | "square" | "diamond" | "hexagon";
    x: number;
    y: number;
    time?: string;
    completed: boolean;
    color: string;
}

interface Connection {
    from: string;
    to: string;
}

const SHAPE_COLORS = [
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#ef4444", // Red
];

export function TodoFlowchart() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [draggedShape, setDraggedShape] = useState<string | null>(null);
    const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
    const [selectedTodo, setSelectedTodo] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    const shapes = [
        { type: "circle", icon: Circle, label: "Task" },
        { type: "square", icon: Square, label: "Meeting" },
        { type: "diamond", icon: Diamond, label: "Decision" },
        { type: "hexagon", icon: Hexagon, label: "Goal" },
    ];

    const handleDragStart = (shapeType: string) => {
        setDraggedShape(shapeType);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!viewportRef.current) return;

        const rect = viewportRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if we're repositioning an existing todo
        if (draggedTodoId) {
            setTodos(
                todos.map((todo) =>
                    todo.id === draggedTodoId
                        ? { ...todo, x, y }
                        : todo
                )
            );
            setDraggedTodoId(null);
        }
        // Otherwise, we're adding a new shape
        else if (draggedShape) {
            const newTodo: TodoItem = {
                id: `todo-${Date.now()}`,
                text: "New Task",
                shape: draggedShape as any,
                x,
                y,
                completed: false,
                color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
            };

            // Auto-connect to the previous todo
            if (todos.length > 0) {
                const lastTodo = todos[todos.length - 1];
                setConnections([...connections, { from: lastTodo.id, to: newTodo.id }]);
            }

            setTodos([...todos, newTodo]);
            setDraggedShape(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleTodoClick = (todoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (connectingFrom) {
            if (connectingFrom !== todoId) {
                setConnections([...connections, { from: connectingFrom, to: todoId }]);
            }
            setConnectingFrom(null);
        } else {
            setSelectedTodo(todoId === selectedTodo ? null : todoId);
        }
    };

    const handleTextChange = (todoId: string, newText: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === todoId ? { ...todo, text: newText } : todo
            )
        );
    };

    const handleTimeChange = (todoId: string, newTime: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === todoId ? { ...todo, time: newTime } : todo
            )
        );
    };

    const handleToggleComplete = (todoId: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleDeleteTodo = (todoId: string) => {
        setTodos(todos.filter((todo) => todo.id !== todoId));
        setConnections(
            connections.filter((conn) => conn.from !== todoId && conn.to !== todoId)
        );
        if (selectedTodo === todoId) setSelectedTodo(null);
    };

    const renderShape = (todo: TodoItem) => {
        const ShapeIcon =
            shapes.find((s) => s.type === todo.shape)?.icon || Circle;
        const isSelected = selectedTodo === todo.id;

        return (
            <div
                key={todo.id}
                className="absolute cursor-move group touch-manipulation"
                style={{
                    left: `${todo.x}px`,
                    top: `${todo.y}px`,
                    transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => handleTodoClick(todo.id, e)}
                draggable
                onDragStart={(e) => {
                    setDraggedTodoId(todo.id);
                    e.dataTransfer.effectAllowed = "move";
                }}
            >
                <div
                    className={`relative transition-all ${isSelected ? "scale-110" : ""
                        }`}
                >
                    <div
                        className={`p-3 sm:p-4 rounded-lg shadow-lg backdrop-blur-sm border-2 transition-all ${todo.completed
                            ? "opacity-60 border-gray-400 bg-gray-100/80"
                            : "border-white/50"
                            }`}
                        style={{
                            backgroundColor: todo.completed
                                ? "#e5e7eb"
                                : `${todo.color}20`,
                            borderColor: todo.completed ? "#9ca3af" : todo.color,
                        }}
                    >
                        <div className="flex items-center gap-2 min-w-[100px] sm:min-w-[120px]">
                            <ShapeIcon
                                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                                style={{ color: todo.completed ? "#6b7280" : todo.color }}
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={todo.text}
                                    onChange={(e) => handleTextChange(todo.id, e.target.value)}
                                    className={`bg-transparent font-medium text-xs sm:text-sm w-full outline-none ${todo.completed
                                        ? "line-through text-gray-500"
                                        : "text-gray-900"
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Task name"
                                />
                                {todo.time && (
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs mt-0.5 sm:mt-1 opacity-70">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span>{todo.time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delete button - Larger touch target on mobile */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTodo(todo.id);
                        }}
                        className="absolute -right-1 sm:-right-2 -top-1 sm:-top-2 w-7 h-7 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-10 touch-manipulation"
                        title="Delete task"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Options menu - Better mobile layout */}
                    {isSelected && (
                        <div className="absolute -right-1 sm:-right-2 top-7 sm:top-6 flex flex-col gap-1 bg-background border rounded-lg shadow-lg p-1 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(todo.id);
                                }}
                                className="p-2 sm:p-1.5 hover:bg-muted active:bg-muted rounded transition-colors touch-manipulation"
                                title={todo.completed ? "Mark incomplete" : "Mark complete"}
                            >
                                <div
                                    className={`w-5 h-5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center ${todo.completed
                                        ? "bg-green-500 border-green-500"
                                        : "border-gray-400"
                                        }`}
                                >
                                    {todo.completed && (
                                        <svg
                                            className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const time = prompt("Enter time (e.g., 09:00 AM):");
                                    if (time) handleTimeChange(todo.id, time);
                                }}
                                className="p-2 sm:p-1.5 hover:bg-muted active:bg-muted rounded transition-colors touch-manipulation"
                                title="Set time"
                            >
                                <Clock className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderConnections = () => {
        return connections.map((conn, index) => {
            const fromTodo = todos.find((t) => t.id === conn.from);
            const toTodo = todos.find((t) => t.id === conn.to);

            if (!fromTodo || !toTodo) return null;

            return (
                <svg
                    key={index}
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                >
                    <defs>
                        <marker
                            id={`arrowhead-${index}`}
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="#6366f1" opacity="0.6" />
                        </marker>
                    </defs>
                    <line
                        x1={fromTodo.x}
                        y1={fromTodo.y}
                        x2={toTodo.x}
                        y2={toTodo.y}
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.6"
                        markerEnd={`url(#arrowhead-${index})`}
                    />
                </svg>
            );
        });
    };

    const handleClearAll = () => {
        if (confirm("Clear all tasks? This cannot be undone.")) {
            setTodos([]);
            setConnections([]);
            setSelectedTodo(null);
        }
    };

    const handleSave = () => {
        localStorage.setItem("todoFlowchart", JSON.stringify({ todos, connections }));
        alert("Schedule saved!");
    };

    useEffect(() => {
        const saved = localStorage.getItem("todoFlowchart");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setTodos(data.todos || []);
                setConnections(data.connections || []);
            } catch (e) {
                console.error("Failed to load saved schedule:", e);
            }
        }
    }, []);

    return (
        <Card className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {/* Header - Mobile First */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-semibold">Daily Schedule Planner</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-light">
                        Drag shapes to create your schedule
                    </p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                    >
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Save</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
                    >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Clear All</span>
                    </Button>
                </div>
            </div>

            {/* Shape Palette - Mobile First: Horizontal Scroll on Mobile */}
            <div className="bg-muted/30 rounded-lg border border-border p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">
                    Shapes:
                </p>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-x-visible">
                    {shapes.map((shape) => {
                        const ShapeIcon = shape.icon;
                        return (
                            <div
                                key={shape.type}
                                draggable
                                onDragStart={() => handleDragStart(shape.type)}
                                className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-3 bg-background rounded-lg border-2 border-dashed border-primary/30 hover:border-primary active:border-primary hover:bg-primary/5 active:bg-primary/10 cursor-grab active:cursor-grabbing transition-all flex-shrink-0 min-w-[72px] sm:min-w-0 touch-manipulation"
                            >
                                <ShapeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{shape.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Viewport - Mobile First: Better mobile sizing */}
            <div
                ref={viewportRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                    setSelectedTodo(null);
                    setConnectingFrom(null);
                }}
                className="relative bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-lg border-2 border-dashed border-border active:border-primary/50 transition-colors touch-manipulation"
                style={{
                    minHeight: "300px",
                    height: "50vh",
                    maxHeight: "500px",
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                }}
            >
                {renderConnections()}
                {todos.map(renderShape)}

                {todos.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground px-4">
                        <div className="text-center space-y-2">
                            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto opacity-30" />
                            <p className="font-light text-xs sm:text-sm">
                                Drag and drop shapes here
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions - Mobile First: Collapsible on very small screens */}
            <div className="bg-muted/20 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                <p className="font-semibold">Quick Guide:</p>
                <ul className="space-y-1 text-muted-foreground font-light list-disc list-inside">
                    <li className="text-[11px] sm:text-sm">Drag shapes - they auto-connect</li>
                    <li className="text-[11px] sm:text-sm">Tap task to select & edit</li>
                    <li className="text-[11px] sm:text-sm">Tap red X to remove</li>
                    <li className="hidden sm:list-item">Set times and mark tasks as complete</li>
                    <li className="hidden sm:list-item">Drag tasks around to reorganize your schedule</li>
                </ul>
            </div>
        </Card>
    );
}
