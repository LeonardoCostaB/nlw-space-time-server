import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
   app.get('/memories', async () => {
      const memories = await prisma.memory.findMany({
         orderBy: {
            createdAt: 'asc',
         }
      })

      return memories.map(memory => {
         const verifyMemoryContent =
            memory.content.length >= 115 ?
               memory.content.substring(0, 115).concat('...') :
               memory.content

         return {
            id: memory.id,
            coverUrl: memory.coverUrl,
            except: verifyMemoryContent,
         }
      })
   })

   app.get('/memories/:id', async (req) => {
      const paramsSchema = z.object({
         id: z.string(),
      })

      const { id } = paramsSchema.parse(req.params)

      const memory = await prisma.memory.findFirstOrThrow({
         where: { id }
      })

      return memory
   })

   app.post('/memories', async (req) => {
      const bodySchema = z.object({
         content: z.string(),
         coverUrl: z.string(),
         isPublic: z.coerce.boolean().default(false),
      })

      const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

      const memory = await prisma.memory.create({
         data: {
            content,
            coverUrl,
            isPublic,
            userId: '0eaaefff-2402-436f-9096-22791bcb333b'
         }
      })

      return memory
   })

   app.put('/memories/:id', async (req) => {
      const paramsSchema = z.object({
         id: z.string(),
      })

      const { id } = paramsSchema.parse(req.params)

      const bodySchema = z.object({
         content: z.string(),
         coverUrl: z.string(),
         isPublic: z.coerce.boolean().default(false),
      })

      const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

      const memory = await prisma.memory.update({
         where: { id },
         data: {
            content,
            coverUrl,
            isPublic,
         },
      })

      return memory
   })

   app.delete('/memories/:id', async (req) => {
      const paramsSchema = z.object({
         id: z.string(),
      })

      const { id } = paramsSchema.parse(req.params)

      return await prisma.memory.delete({
         where: { id }
      })
   })
}
