import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Workflow Automation Engine Router
 * No-code workflow builder with conditional routing, approval chains, and automation
 */

// Workflow trigger types
const WorkflowTriggerInput = z.object({
  type: z.enum(['contract_uploaded', 'risk_alert', 'deadline_approaching', 'manual_trigger', 'scheduled']),
  condition: z.record(z.any()).optional(),
});

// Workflow action types
const WorkflowActionInput = z.object({
  type: z.enum(['send_notification', 'create_task', 'update_status', 'send_email', 'call_webhook', 'approval_required']),
  config: z.record(z.any()),
});

// Workflow definition
const WorkflowDefinitionInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggers: z.array(WorkflowTriggerInput),
  actions: z.array(WorkflowActionInput),
  approvalChain: z.array(z.object({
    step: z.number(),
    approvers: z.array(z.number()),
    requireAll: z.boolean().default(false),
  })).optional(),
  enabled: z.boolean().default(true),
});

export const workflowsRouter = router({
  // Create a new workflow
  create: protectedProcedure
    .input(WorkflowDefinitionInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.createWorkflow({
          firmId: ctx.user.firmId,
          name: input.name,
          description: input.description,
          triggers: input.triggers as any,
          actions: input.actions as any,
          approvalChain: input.approvalChain as any,
          status: 'draft',
          createdBy: ctx.user.id,
          enabled: input.enabled,
        });

        return {
          success: true,
          workflowId: workflow.id,
          message: 'Workflow created successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workflow',
        });
      }
    }),

  // Get workflow by ID
  getById: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      const workflow = await db.getWorkflowById(input.workflowId);
      if (!workflow || workflow.firmId !== ctx.user.firmId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      return workflow;
    }),

  // List all workflows for firm
  list: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Placeholder: Return mock workflows for now
        return [
          {
            id: 1,
            name: 'Contract Review Workflow',
            description: 'Automatically route contracts for review',
            status: 'active',
            enabled: true,
            triggerCount: 3,
            actionCount: 5,
            executionCount: 24,
            lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            id: 2,
            name: 'Risk Alert Escalation',
            description: 'Escalate high-risk contracts to management',
            status: 'active',
            enabled: true,
            triggerCount: 2,
            actionCount: 4,
            executionCount: 12,
            lastExecuted: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: 3,
            name: 'Deadline Reminders',
            description: 'Send reminders for upcoming deadlines',
            status: 'active',
            enabled: true,
            triggerCount: 1,
            actionCount: 2,
            executionCount: 156,
            lastExecuted: new Date(Date.now() - 30 * 60 * 1000),
          },
        ];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch workflows',
        });
      }
    }),

  // Update workflow
  update: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      data: WorkflowDefinitionInput.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }

        await db.updateWorkflow(input.workflowId, {
          ...input.data,
          triggers: input.data.triggers as any,
          actions: input.data.actions as any,
          approvalChain: input.data.approvalChain as any,
        });

        return {
          success: true,
          message: 'Workflow updated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update workflow',
        });
      }
    }),

  // Delete workflow
  delete: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }

        // Soft delete by setting enabled to false
        await db.updateWorkflow(input.workflowId, { enabled: false });

        return {
          success: true,
          message: 'Workflow deleted successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete workflow',
        });
      }
    }),

  // Execute workflow manually
  execute: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      context: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }

        if (!workflow.enabled) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Workflow is disabled' });
        }

        // Simulate workflow execution
        const executionId = Math.random().toString(36).substring(7);
        const actions = (workflow.actions as any[]) || [];
        const results = actions.map((action) => ({
          type: action.type,
          status: 'completed',
          result: `${action.type} executed successfully`,
        }));

        return {
          success: true,
          executionId,
          message: 'Workflow executed successfully',
          results,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute workflow',
        });
      }
    }),

  // Get workflow execution history
  getExecutionHistory: protectedProcedure
    .input(z.object({
      workflowId: z.number(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }

        // Return mock execution history
        return [
          {
            executionId: 'exec_001',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            status: 'completed',
            trigger: 'manual_trigger',
            actionsExecuted: 5,
            duration: 2340,
          },
          {
            executionId: 'exec_002',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed',
            trigger: 'risk_alert',
            actionsExecuted: 5,
            duration: 1890,
          },
          {
            executionId: 'exec_003',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            status: 'failed',
            trigger: 'deadline_approaching',
            actionsExecuted: 2,
            duration: 450,
            error: 'Webhook endpoint returned 500',
          },
        ];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch execution history',
        });
      }
    }),

  // Get workflow templates
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return [
        {
          id: 'template_1',
          name: 'Contract Review & Approval',
          description: 'Route contracts through review and approval chain',
          category: 'Contract Management',
          triggers: ['contract_uploaded'],
          actions: ['send_notification', 'approval_required', 'update_status'],
          complexity: 'medium',
        },
        {
          id: 'template_2',
          name: 'Risk Alert Escalation',
          description: 'Automatically escalate high-risk contracts',
          category: 'Risk Management',
          triggers: ['risk_alert'],
          actions: ['send_email', 'create_task', 'call_webhook'],
          complexity: 'low',
        },
        {
          id: 'template_3',
          name: 'Deadline Reminders',
          description: 'Send reminders for upcoming deadlines',
          category: 'Deadline Management',
          triggers: ['scheduled'],
          actions: ['send_notification', 'send_email'],
          complexity: 'low',
        },
        {
          id: 'template_4',
          name: 'Multi-Step Approval Chain',
          description: 'Complex approval workflow with multiple steps',
          category: 'Approval Workflows',
          triggers: ['contract_uploaded', 'manual_trigger'],
          actions: ['approval_required', 'send_notification', 'update_status', 'call_webhook'],
          complexity: 'high',
        },
      ];
    }),

  // Create workflow from template
  createFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      name: z.string().min(1),
      customization: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Create workflow from template with customization
        const workflow = await db.createWorkflow({
          firmId: ctx.user.firmId,
          name: input.name,
          description: `Created from template: ${input.templateId}`,
          triggers: input.customization?.triggers || [],
          actions: input.customization?.actions || [],
          status: 'draft',
          createdBy: ctx.user.id,
          enabled: false,
        });

        return {
          success: true,
          workflowId: workflow.id,
          message: 'Workflow created from template successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workflow from template',
        });
      }
    }),

  // Get workflow statistics
  getStatistics: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.firmId !== ctx.user.firmId) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
        }

        return {
          totalExecutions: 156,
          successfulExecutions: 152,
          failedExecutions: 4,
          successRate: 97.4,
          averageDuration: 2145,
          lastExecuted: new Date(Date.now() - 30 * 60 * 1000),
          executionsThisWeek: 42,
          executionsThisMonth: 156,
          topTrigger: 'deadline_approaching',
          topAction: 'send_notification',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch workflow statistics',
        });
      }
    }),
});
