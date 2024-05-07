import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { generateSlug } from "../utils/generate-slug"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"


export async function createEvent(app: FastifyInstance){

    app.withTypeProvider<ZodTypeProvider>().post('/events', {
        schema: {
        tags: ['events'],
        summary: 'create event',
        body: 
        z.object({
            title: z.string().min(4),
            details: z.string().nullable(),
            maximumAttendees: z.number().int().positive().nullable(),
        }),
    
        response: {
            201: z.object({
                eventId: z.string().uuid()
            })
        }
        }}
        
    , async (req,res) => {
    
        const data = req.body
    
        const slug = generateSlug(data.title)
    
        const titleWithSameSlug = await prisma.event.findUnique({
            where:{
                slug 
            }
        })
    
        if (titleWithSameSlug !== null) {
            throw new Error('Another event with same title already exists')
        }
    
        const event = await prisma.event.create({
            data: {
                title: data.title,
                details: data.details,
                maximumAttendees: data.maximumAttendees,
                slug
            }
        })
    
        return res.status(201).send({eventId:event.id})
    })

}

