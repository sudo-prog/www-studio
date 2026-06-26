"use client";

export interface WorkflowContext {
  prompt: string;
  canvasState?: unknown;
}

export interface WorkflowResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function executeWorkflow(_context: WorkflowContext): Promise<WorkflowResult> {
  // Stub: AI workflow execution not yet implemented
  return { success: false, error: "Workflow execution not yet implemented" };
}
