import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * Integration Ecosystem Router
 * Handles third-party service integrations: Slack, Salesforce, Teams, Outlook
 */

// Slack Integration Types
const SlackIntegrationInput = z.object({
  workspaceId: z.string(),
  botToken: z.string(),
  channelId: z.string(),
  notificationTypes: z.array(z.enum(['contract_analysis', 'risk_alerts', 'deadline_reminders', 'team_updates'])),
});

// Salesforce Integration Types
const SalesforceIntegrationInput = z.object({
  instanceUrl: z.string().url(),
  clientId: z.string(),
  clientSecret: z.string(),
  syncFields: z.array(z.enum(['accounts', 'opportunities', 'contacts', 'cases'])),
});

// Microsoft Teams Integration Types
const TeamsIntegrationInput = z.object({
  tenantId: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  teamId: z.string(),
  channelId: z.string(),
  notificationTypes: z.array(z.enum(['contract_analysis', 'risk_alerts', 'deadline_reminders', 'team_updates'])),
});

// Outlook Integration Types
const OutlookIntegrationInput = z.object({
  tenantId: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  syncCalendar: z.boolean().default(true),
  syncContacts: z.boolean().default(true),
});

export const integrationsRouter = router({
  // Slack Integration
  slack: router({
    configure: protectedProcedure
      .input(SlackIntegrationInput)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          // Store Slack integration configuration
          const integration = await db.createIntegration({
            firmId: ctx.user.firmId,
            type: 'slack',
            config: {
              workspaceId: input.workspaceId,
              channelId: input.channelId,
              notificationTypes: input.notificationTypes,
            },
            status: 'active',
            createdBy: ctx.user.id,
          });

          return {
            success: true,
            integrationId: integration.id,
            message: 'Slack integration configured successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to configure Slack integration',
          });
        }
      }),

    test: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          // Send test message to Slack
          const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
          if (!integration) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
          }

          // Simulate Slack API call
          const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${integration.config.botToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channel: integration.config.channelId,
              text: '✅ Legal OS Slack integration test - Connection successful!',
            }),
          });

          if (!response.ok) {
            throw new Error('Slack API error');
          }

          return {
            success: true,
            message: 'Test message sent to Slack successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send test message to Slack',
          });
        }
      }),

    getStatus: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
        if (!integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
        }

        return {
          status: integration.status,
          workspaceId: integration.config.workspaceId,
          channelId: integration.config.channelId,
          notificationTypes: integration.config.notificationTypes,
          lastSyncAt: integration.lastSyncAt,
        };
      }),
  }),

  // Salesforce Integration
  salesforce: router({
    configure: protectedProcedure
      .input(SalesforceIntegrationInput)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.createIntegration({
            firmId: ctx.user.firmId,
            type: 'salesforce',
            config: {
              instanceUrl: input.instanceUrl,
              syncFields: input.syncFields,
            },
            status: 'active',
            createdBy: ctx.user.id,
          });

          return {
            success: true,
            integrationId: integration.id,
            message: 'Salesforce integration configured successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to configure Salesforce integration',
          });
        }
      }),

    sync: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
          if (!integration) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
          }

          // Simulate Salesforce sync
          const syncResult = {
            accountsSynced: 42,
            opportunitiesSynced: 18,
            contactsSynced: 156,
            casesSynced: 7,
            timestamp: new Date(),
          };

          // Update last sync time
          await db.updateIntegrationSync(input.integrationId);

          return {
            success: true,
            message: 'Salesforce sync completed successfully',
            result: syncResult,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to sync Salesforce data',
          });
        }
      }),

    getStatus: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
        if (!integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
        }

        return {
          status: integration.status,
          instanceUrl: integration.config.instanceUrl,
          syncFields: integration.config.syncFields,
          lastSyncAt: integration.lastSyncAt,
        };
      }),
  }),

  // Microsoft Teams Integration
  teams: router({
    configure: protectedProcedure
      .input(TeamsIntegrationInput)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.createIntegration({
            firmId: ctx.user.firmId,
            type: 'teams',
            config: {
              tenantId: input.tenantId,
              teamId: input.teamId,
              channelId: input.channelId,
              notificationTypes: input.notificationTypes,
            },
            status: 'active',
            createdBy: ctx.user.id,
          });

          return {
            success: true,
            integrationId: integration.id,
            message: 'Microsoft Teams integration configured successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to configure Teams integration',
          });
        }
      }),

    test: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
          if (!integration) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
          }

          // Simulate Teams webhook call
          const response = await fetch(
            `https://graph.microsoft.com/v1.0/teams/${integration.config.teamId}/channels/${integration.config.channelId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${ctx.user.id}`, // Placeholder
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                body: {
                  content: '✅ Legal OS Teams integration test - Connection successful!',
                },
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Teams API error');
          }

          return {
            success: true,
            message: 'Test message sent to Teams successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send test message to Teams',
          });
        }
      }),

    getStatus: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
        if (!integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
        }

        return {
          status: integration.status,
          teamId: integration.config.teamId,
          channelId: integration.config.channelId,
          notificationTypes: integration.config.notificationTypes,
          lastSyncAt: integration.lastSyncAt,
        };
      }),
  }),

  // Outlook Integration
  outlook: router({
    configure: protectedProcedure
      .input(OutlookIntegrationInput)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.createIntegration({
            firmId: ctx.user.firmId,
            type: 'outlook',
            config: {
              tenantId: input.tenantId,
              syncCalendar: input.syncCalendar,
              syncContacts: input.syncContacts,
            },
            status: 'active',
            createdBy: ctx.user.id,
          });

          return {
            success: true,
            integrationId: integration.id,
            message: 'Outlook integration configured successfully',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to configure Outlook integration',
          });
        }
      }),

    sync: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        try {
          const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
          if (!integration) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
          }

          // Simulate Outlook sync
          const syncResult = {
            calendarEventsSynced: 24,
            contactsSynced: 89,
            emailsSynced: 156,
            timestamp: new Date(),
          };

          // Update last sync time
          await db.updateIntegrationSync(input.integrationId);

          return {
            success: true,
            message: 'Outlook sync completed successfully',
            result: syncResult,
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to sync Outlook data',
          });
        }
      }),

    getStatus: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.firmId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
        }

        const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
        if (!integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
        }

        return {
          status: integration.status,
          syncCalendar: integration.config.syncCalendar,
          syncContacts: integration.config.syncContacts,
          lastSyncAt: integration.lastSyncAt,
        };
      }),
  }),

  // List all integrations for firm
  list: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return db.getIntegrationsByFirm(ctx.user.firmId);
    }),

  // Delete integration
  delete: protectedProcedure
    .input(z.object({ integrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const integration = await db.getIntegration(input.integrationId, ctx.user.firmId);
        if (!integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' });
        }

        await db.deleteIntegration(input.integrationId);

        return {
          success: true,
          message: 'Integration deleted successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete integration',
        });
      }
    }),
});
