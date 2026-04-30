import { z } from 'zod';
import { protectedProcedure, router } from './_core/trpc';
import { storagePut } from './storage';
import { getDb } from './db';
import { documents } from '../drizzle/schema';
import { eq, like, and } from 'drizzle-orm';

export const documentsRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileContent: z.string(),
        fileMimeType: z.string(),
        fileSize: z.number(),
        tempId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        if (input.fileSize > 50 * 1024 * 1024) {
          throw new Error('File size exceeds 50MB limit');
        }

        const buffer = Buffer.from(input.fileContent.split(',')[1] || input.fileContent, 'base64');
        const storageKey = `documents/${ctx.user.firmId}/${Date.now()}-${input.fileName}`;
        const { url, key } = await storagePut(storageKey, buffer, input.fileMimeType);

        const db = await getDb();
        if (!db) throw new Error('Database connection failed');

        const result = await db
          .insert(documents)
          .values({
            firmId: ctx.user.firmId!,
            name: input.fileName,
            fileName: input.fileName,
            type: 'other',
            fileKey: key,
            fileUrl: url,
            fileMimeType: input.fileMimeType,
            fileSize: input.fileSize,
            uploadedBy: ctx.user.id,
            status: 'active',
          });

        return {
          tempId: input.tempId,
          fileName: input.fileName,
          fileUrl: url,
        };
      } catch (error) {
        throw new Error(`Upload failed: ${(error as Error).message}`);
      }
    }),

  list: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const firmDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.firmId, ctx.user.firmId!));

    return firmDocuments;
  }),

  getById: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const document = await db
        .select()
        .from(documents)
        .where(
          and(eq(documents.id, input.documentId), eq(documents.firmId, ctx.user.firmId!))
        );

      if (!document.length) {
        throw new Error('Document not found');
      }

      return document[0];
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const results = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.firmId, ctx.user.firmId!),
            like(documents.name, `%${input.query}%`)
          )
        );

      return results;
    }),

  delete: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const document = await db
        .select()
        .from(documents)
        .where(
          and(eq(documents.id, input.documentId), eq(documents.firmId, ctx.user.firmId!))
        );

      if (!document.length) {
        throw new Error('Document not found');
      }

      await db.delete(documents).where(eq(documents.id, input.documentId));

      return { success: true };
    }),
});
