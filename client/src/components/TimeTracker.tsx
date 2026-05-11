import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Play, Pause, Square, Clock } from "lucide-react";

interface TimeTrackerProps {
  onTimerStop?: (duration: number) => void;
}

export default function TimeTracker({ onTimerStop }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [taskType, setTaskType] = useState("research");
  const [description, setDescription] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  const startTimerMutation = trpc.timeTracking.startTimer.useMutation();
  const pauseTimerMutation = trpc.timeTracking.pauseTimer.useMutation();
  const resumeTimerMutation = trpc.timeTracking.resumeTimer.useMutation();
  const stopTimerMutation = trpc.timeTracking.stopTimer.useMutation();
  const getActiveSessionQuery = trpc.timeTracking.getActiveSession.useQuery();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Load active session on mount
  useEffect(() => {
    if (getActiveSessionQuery.data) {
      setActiveSessionId(getActiveSessionQuery.data.id);
      setTaskType(getActiveSessionQuery.data.taskType);
      setDescription(getActiveSessionQuery.data.description || "");
      setIsRunning(getActiveSessionQuery.data.status === "running");
      setIsPaused(getActiveSessionQuery.data.status === "paused");
    }
  }, [getActiveSessionQuery.data]);

  const handleStartTimer = async () => {
    if (!description.trim()) {
      alert("Please enter a task description");
      return;
    }

    try {
      const session = await startTimerMutation.mutateAsync({
        taskType: taskType as any,
        description,
      });
      setActiveSessionId(session.id);
      setIsRunning(true);
      setElapsedSeconds(0);
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handlePauseTimer = async () => {
    if (!activeSessionId) return;
    try {
      await pauseTimerMutation.mutateAsync({ sessionId: activeSessionId });
      setIsRunning(false);
      setIsPaused(true);
    } catch (error) {
      console.error("Failed to pause timer:", error);
    }
  };

  const handleResumeTimer = async () => {
    if (!activeSessionId) return;
    try {
      await resumeTimerMutation.mutateAsync({ sessionId: activeSessionId });
      setIsRunning(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Failed to resume timer:", error);
    }
  };

  const handleStopTimer = async () => {
    if (!activeSessionId) return;
    try {
      await stopTimerMutation.mutateAsync({
        sessionId: activeSessionId,
        isBillable: "yes",
      });
      setIsRunning(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      setActiveSessionId(null);
      setDescription("");
      onTimerStop?.(elapsedSeconds);
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-xl p-6">
      <div className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-5xl font-bold text-cyan-400 font-mono mb-2">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-slate-400 text-sm">
            {isRunning ? (isPaused ? "Paused" : "Running") : "Stopped"}
          </p>
        </div>

        {/* Task Type Selection */}
        {!isRunning && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm"
            >
              <option value="research">Research</option>
              <option value="drafting">Drafting</option>
              <option value="review">Review</option>
              <option value="client_meeting">Client Meeting</option>
              <option value="court_appearance">Court Appearance</option>
              <option value="negotiation">Negotiation</option>
              <option value="filing">Filing</option>
              <option value="consultation">Consultation</option>
              <option value="administrative">Administrative</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            disabled={isRunning}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-50"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <>
              <Button
                onClick={handleStartTimer}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={isPaused ? handleResumeTimer : handlePauseTimer}
                className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={handleStopTimer}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-500">Hours</p>
            <p className="text-lg font-semibold text-cyan-400">
              {(elapsedSeconds / 3600).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Minutes</p>
            <p className="text-lg font-semibold text-cyan-400">
              {Math.floor((elapsedSeconds % 3600) / 60)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Seconds</p>
            <p className="text-lg font-semibold text-cyan-400">
              {elapsedSeconds % 60}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
