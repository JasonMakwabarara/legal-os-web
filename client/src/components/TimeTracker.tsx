import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Play, Pause, Square, Clock } from "lucide-react";

interface TimeTrackerProps {
  onTimerStop?: (duration: number) => void;
}

export function TimeTracker({ onTimerStop }: TimeTrackerProps) {
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

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start timer
  const handleStart = async () => {
    try {
      const result = await startTimerMutation.mutateAsync({
        taskType,
        description,
      });
      setActiveSessionId(result.id);
      setIsRunning(true);
      setIsPaused(false);
      setElapsedSeconds(0);
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  // Pause timer
  const handlePause = async () => {
    if (activeSessionId) {
      try {
        await pauseTimerMutation.mutateAsync({ sessionId: activeSessionId });
        setIsPaused(true);
      } catch (error) {
        console.error("Failed to pause timer:", error);
      }
    }
  };

  // Resume timer
  const handleResume = async () => {
    if (activeSessionId) {
      try {
        await resumeTimerMutation.mutateAsync({ sessionId: activeSessionId });
        setIsPaused(false);
      } catch (error) {
        console.error("Failed to resume timer:", error);
      }
    }
  };

  // Stop timer
  const handleStop = async () => {
    if (activeSessionId) {
      try {
        await stopTimerMutation.mutateAsync({ sessionId: activeSessionId });
        setIsRunning(false);
        setIsPaused(false);
        if (onTimerStop) {
          onTimerStop(elapsedSeconds);
        }
        setElapsedSeconds(0);
        setActiveSessionId(null);
      } catch (error) {
        console.error("Failed to stop timer:", error);
      }
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="space-y-4">
        {/* Timer Display */}
        <div className="flex items-center justify-center">
          <Clock className="w-6 h-6 text-teal-500 mr-2" />
          <div className="text-5xl font-mono font-bold text-white">{formatTime(elapsedSeconds)}</div>
        </div>

        {/* Task Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Task Type</label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white disabled:opacity-50"
          >
            <option value="research">Legal Research</option>
            <option value="drafting">Contract Drafting</option>
            <option value="review">Document Review</option>
            <option value="meeting">Client Meeting</option>
            <option value="admin">Administrative</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRunning}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 disabled:opacity-50"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button
                  onClick={handlePause}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={handleResume}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={handleStop}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Status */}
        {isRunning && (
          <div className="text-sm text-center">
            {isPaused ? (
              <span className="text-yellow-400">⏸ Paused</span>
            ) : (
              <span className="text-green-400">▶ Running</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default TimeTracker;
