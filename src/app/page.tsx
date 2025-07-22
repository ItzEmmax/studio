'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Load tasks from localStorage on initial render after mounting
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
          console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isMounted]);

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    const newTask: Task = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setInput('');
  };

  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  if (!isMounted) {
    // Avoids hydration mismatch by not rendering on the server.
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2 text-primary-foreground bg-primary rounded-lg py-2 shadow-md">TaskFlow</h1>
          <p className="text-muted-foreground mt-4">A minimalist to-do list to keep you on track.</p>
        </header>

        <Card className="mb-8 shadow-lg rounded-lg">
          <CardContent className="p-4">
            <form onSubmit={handleAddTask} className="flex gap-4">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a new task..."
                className="flex-grow text-base"
                aria-label="New task"
              />
              <Button type="submit" size="icon" aria-label="Add task">
                <Plus />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className={cn(
              "transition-all duration-300 ease-in-out shadow-sm rounded-lg",
              task.completed && "bg-muted"
            )}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id)}
                    className="h-5 w-5 rounded"
                    aria-labelledby={`task-label-${task.id}`}
                  />
                  <label
                    id={`task-label-${task.id}`}
                    htmlFor={`task-${task.id}`}
                    className={cn(
                      "text-base cursor-pointer transition-colors",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8"
                  aria-label={`Delete task: ${task.text}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && (
            <Card className="text-center shadow-sm rounded-lg">
              <CardContent className="p-8">
                <p className="text-muted-foreground">You have no tasks yet. Add one to get started!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
