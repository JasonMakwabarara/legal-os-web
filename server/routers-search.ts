import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as dbSearch from "./db-search";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const searchRouter = router({
  /**
   * Full-text search across documents
   */
  searchDocuments: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        documentType: z.string().optional(),
        minRelevance: z.number().min(0).max(100).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        const results = await dbSearch.searchDocuments(ctx.user.firmId, input.query, {
          documentType: input.documentType,
          minRelevance: input.minRelevance,
          limit: input.limit,
          offset: input.offset,
        });

        // Record search in history
        await dbSearch.recordSearchQuery({
          firmId: ctx.user.firmId,
          userId: ctx.user.id,
          searchQuery: input.query,
          resultCount: results.length,
          filters: {
            documentType: input.documentType,
            minRelevance: input.minRelevance,
          },
          searchType: 'full_text',
          durationMs: 0,
        });

        return results;
      } catch (error) {
        console.error('Search error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Search failed',
        });
      }
    }),

  /**
   * Extract and categorize clauses from a document using AI
   */
  extractClausesFromDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      try {
        // Get document
        const allDocs = await db.getDocumentsByFirm(ctx.user.firmId);
        const document = allDocs.find(d => d.id === input.documentId);
        if (!document) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }

        // Get OCR content
        const ocrContent = await dbSearch.getOcrContentByDocumentId(input.documentId, ctx.user.firmId);
        if (!ocrContent || !ocrContent.extractedText) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Document OCR content not available',
          });
        }

        // Use AI to extract and categorize clauses
        const extractionPrompt = `You are a legal expert. Extract all important clauses from the following legal document text. For each clause, identify:
1. The clause text
2. The category (e.g., "Limitation of Liability", "Indemnification", "Confidentiality", etc.)
3. Risk level (low, medium, high)
4. Any flagged issues or concerns
5. Suggested revisions if applicable

Document text:
${ocrContent.extractedText.substring(0, 5000)}

Return the response as a JSON array with objects containing: clauseText, category, riskLevel, flaggedIssues (array), suggestedRevision`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are a legal document analysis expert.' },
            { role: 'user', content: extractionPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'clause_extraction',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  clauses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        clauseText: { type: 'string' },
                        category: { type: 'string' },
                        riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
                        flaggedIssues: { type: 'array', items: { type: 'string' } },
                        suggestedRevision: { type: 'string' },
                      },
                      required: ['clauseText', 'category', 'riskLevel'],
                    },
                  },
                },
                required: ['clauses'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;

        // Get or create clause categories
        const categories = await dbSearch.listClauseCategories();
        const categoryMap = new Map(categories.map(c => [c.name, c.id]));

        // Save extracted clauses
        const savedClauses = [];
        for (const clause of parsed.clauses) {
          let categoryId = categoryMap.get(clause.category);

          if (!categoryId) {
            const result = await dbSearch.createClauseCategory({
              name: clause.category,
              riskLevel: clause.riskLevel,
            });
            categoryId = (result as any).insertId || 0;
          }

          const savedClause = await dbSearch.createExtractedClause({
            documentId: input.documentId,
            firmId: ctx.user.firmId,
            categoryId: categoryId || null,
            clauseText: clause.clauseText,
            riskLevel: clause.riskLevel,
            aiConfidence: '85' as any,
            flaggedIssues: clause.flaggedIssues || [],
            suggestedRevision: clause.suggestedRevision,
          });

          savedClauses.push(savedClause);
        }

        return {
          success: true,
          clausesExtracted: savedClauses.length,
          clauses: parsed.clauses,
        };
      } catch (error) {
        console.error('Clause extraction error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Clause extraction failed',
        });
      }
    }),

  /**
   * Get extracted clauses for a document
   */
  getDocumentClauses: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.getExtractedClausesByDocumentId(input.documentId, ctx.user.firmId);
    }),

  /**
   * Get high-risk clauses across all documents
   */
  getHighRiskClauses: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.getHighRiskClauses(ctx.user.firmId, input.limit);
    }),

  /**
   * Search for clauses by category
   */
  searchClausesByCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.getExtractedClausesByCategory(input.categoryId, ctx.user.firmId);
    }),

  /**
   * Get search history for current user
   */
  getSearchHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.getUserSearchHistory(ctx.user.id, ctx.user.firmId, input.limit);
    }),

  /**
   * Get top search queries for the firm
   */
  getTopSearchQueries: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.getTopSearchQueries(ctx.user.firmId, input.limit);
    }),

  /**
   * Save a search for later use
   */
  saveSearch: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        searchQuery: z.string().min(1),
        filters: z.any().optional(),
        searchType: z.enum(['full_text', 'clause', 'document', 'advanced']).default('full_text'),
        isPublic: z.enum(['yes', 'no']).default('no'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      return dbSearch.createSavedSearch({
        firmId: ctx.user.firmId,
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        searchQuery: input.searchQuery,
        filters: input.filters,
        searchType: input.searchType,
        isPublic: input.isPublic,
      });
    }),

  /**
   * Get saved searches for current user
   */
  getSavedSearches: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
    }

    return dbSearch.getUserSavedSearches(ctx.user.id, ctx.user.firmId);
  }),

  /**
   * Delete a saved search
   */
  deleteSavedSearch: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.firmId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
      }

      const search = await dbSearch.getSavedSearchById(input.id, ctx.user.firmId);
      if (!search) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Saved search not found' });
      }

      if (search.userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot delete other user\'s searches' });
      }

      return dbSearch.deleteSavedSearch(input.id);
    }),

  /**
   * Get clause categories
   */
  getClauseCategories: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.firmId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'User not assigned to a firm' });
    }

    return dbSearch.listClauseCategories();
  }),
});
