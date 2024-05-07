import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getEvent(app:FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId', {
        schema: {
            tags: ['events'],
            summary: 'get an event',
            params: z.object({
                eventId: z.string().uuid()
            }),
            response: {
                200: z.object({
                event: z.object({
                    id: z.string().uuid(),
                    slug: z.string(),
                    maximumAttendees: z.number().int().nullable(),
                    title:z.string(),
                    count_attendees: z.number().int()
                })
            })
            }
        }
        
    }, async (req,res) => {

        const {eventId} = req.params

        const event = await prisma.event.findUnique({
            select: {
                id: true,
                slug: true,
                maximumAttendees: true,
                title: true,
                _count: { //recurso do prisma que permite contar registros determinados com select, neste caso a quantidade de participantes
                    select: {
                        attendees:true
                    }
                }

            },
            where: {
                id:eventId
            }
        })

        if (event === null) {
            throw new Error('Event not exists')
        }

        return res.send({
            event: {
                id: event.id,
                slug: event.slug,
                maximumAttendees: event.maximumAttendees,
                title: event.title,
                count_attendees: event._count.attendees
            }
        })
    }) 
    
}