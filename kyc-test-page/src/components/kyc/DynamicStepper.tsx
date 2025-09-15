"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  optional?: boolean;
}

interface DynamicStepperProps {
  steps: StepperStep[];
  onComplete?: (data: Record<string, any>) => void;
  onStepChange?: (currentStep: number, stepData: any) => void;
  className?: string;
  canProceed?: (currentStep: number, data: Record<string, any>) => boolean;
  /** Controlled current step (optional). If provided, component becomes controlled. */
  current?: number;
  /** Controlled setter for current step (optional). Required if current is provided. */
  setCurrent?: (n: number) => void;
}

export function DynamicStepper({
  steps,
  onComplete,
  onStepChange,
  className,
  canProceed,
  current,
  setCurrent,
}: DynamicStepperProps) {
  const [internalStep, setInternalStep] = useState(0);
  const cur = current ?? internalStep;
  const setCur = setCurrent ?? setInternalStep;

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});

  const proceedAllowed = useMemo(() => {
    return canProceed ? canProceed(cur, stepData) : true;
  }, [canProceed, cur, stepData]);

  const handleNext = () => {
    if (!proceedAllowed) return;
    if (cur < steps.length - 1) {
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(cur);
      setCompletedSteps(newCompletedSteps);

      const nextStep = cur + 1;
      setCur(nextStep);
      onStepChange?.(nextStep, stepData);
    } else {
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(cur);
      setCompletedSteps(newCompletedSteps);
      onComplete?.(stepData);
    }
  };

  const handlePrevious = () => {
    if (cur > 0) {
      const prevStep = cur - 1;
      setCur(prevStep);
      onStepChange?.(prevStep, stepData);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    const canJump =
      completedSteps.has(stepIndex) ||
      stepIndex === cur ||
      stepIndex === cur + 1;
    if (!canJump) return;
    if (stepIndex > cur && !proceedAllowed) return;
    setCur(stepIndex);
    onStepChange?.(stepIndex, stepData);
  };

  const updateStepData = (stepId: string, data: any) => {
    setStepData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex);
  const isStepActive = (stepIndex: number) => stepIndex === cur;
  const isStepClickable = (stepIndex: number) =>
    completedSteps.has(stepIndex) || stepIndex === cur || stepIndex === cur + 1;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(index)}
                disabled={
                  !isStepClickable(index) || (index > cur && !proceedAllowed)
                }
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200",
                  isStepCompleted(index)
                    ? "bg-blue-600 text-white border-blue-600"
                    : isStepActive(index)
                    ? "bg-white text-blue-600 border-blue-600"
                    : isStepClickable(index) && (index <= cur || proceedAllowed)
                    ? "bg-white text-gray-500 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                    : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                )}
              >
                {isStepCompleted(index) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </button>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isStepActive(index) ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
                {step.optional && (
                  <p className="text-xs text-gray-400">Optional</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-200",
                  isStepCompleted(index) ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 p-4 bg-white text-gray-900">
        <div className="mb-2"></div>
        <div className="min-h-[200px]">
          {React.cloneElement(steps[cur].content as React.ReactElement, {
            stepData: stepData[steps[cur].id],
            updateStepData: (data: any) => updateStepData(steps[cur].id, data),
          })}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={cur === 0}
          className="flex items-center gap-2 bg-white text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Step {cur + 1} of {steps.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!proceedAllowed}
          className={cn(
            "flex items-center gap-2",
            proceedAllowed
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {cur === steps.length - 1 ? "Complete" : "Next"}
          {cur < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
