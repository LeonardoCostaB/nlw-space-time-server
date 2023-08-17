import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
   app.addHook('preHandler', async (req) => {
      await req.jwtVerify();
   })

   app.get('/memories', async (req) => {
      console.log("entrei", req.user.sub)

      const memories = await prisma.memory.findMany({
         where: {
            userId: req.user.sub,
         },
         orderBy: {
            createdAt: 'asc',
         }
      })

      console.log("memories", memories)

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

   app.get('/memories/:id', async (req, res) => {
      const paramsSchema = z.object({
         id: z.string(),
      })

      const { id } = paramsSchema.parse(req.params)

      const memory = await prisma.memory.findFirstOrThrow({
         where: { id }
      })

      if (!memory.isPublic && memory.userId !== req.user.sub) {
         return res.status(401).send()
      }

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
            userId: req.user.sub
         }
      })

      return memory
   })

   app.put('/memories/:id', async (req, res) => {
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

      let memory = await prisma.memory.findFirstOrThrow({
         where: {
            id: req.user.sub
         }
      })

      if (memory.id !== req.user.sub) {
         return res.status(401).send()
      }

      memory = await prisma.memory.update({
         where: { id },
         data: {
            content,
            coverUrl,
            isPublic,
         },
      })

      return memory
   })

   app.delete('/memories/:id', async (req, res) => {
      const paramsSchema = z.object({
         id: z.string(),
      })

      const { id } = paramsSchema.parse(req.params)

      const memory = await prisma.memory.findFirstOrThrow({
         where: {
            id: req.user.sub
         }
      })

      if (memory.id !== req.user.sub) {
         return res.status(401).send()
      }

      return await prisma.memory.delete({
         where: { id }
      })
   })
}
