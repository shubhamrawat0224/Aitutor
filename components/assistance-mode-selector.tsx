"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, BookOpen, Compass } from "lucide-react";

export type AssistanceMode = "hint" | "concept" | "resource" | "socratic";

interface AssistanceModeSelectorProps {
  value: AssistanceMode;
  onChange: (mode: AssistanceMode) => void;
}

const modes = [
  {
    id: "hint" as const,
    label: "Hint",
    description: "Get a small hint ",
    icon: Lightbulb,
  },
  {
    id: "concept" as const,
    label: "Concept",
    description: "Learn concept",
    icon: BookOpen,
  },
  {
    id: "resource" as const,
    label: "Resource",
    description: "Get recommendation",
    icon: Compass,
  },
  {
    id: "socratic" as const,
    label: "Socratic",
    description: "Be guided",
    icon: HelpCircle,
  },
];

export function AssistanceModeSelector({
  value,
  onChange,
}: AssistanceModeSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Assistance Mode</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Button
              key={mode.id}
              variant={value === mode.id ? "default" : "outline"}
              className="flex flex-col h-auto px-4 py-3 space-y-2"
              onClick={() => onChange(mode.id)}
            >
              <Icon className="h-5 w-5" />
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {mode.description}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
