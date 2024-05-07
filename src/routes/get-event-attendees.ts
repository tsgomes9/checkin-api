import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app:FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
        schema: {
            tags: ['attendees'],
            summary: 'get attendees from event',
            params: z.object({
                eventId: z.string().uuid()
            }),
            querystring: z.object({ //string que será pequisada na URL após a ?. Ex: /attendees?query=joao
                query: z.string().nullish(),
                pageIndex: z.string().nullable().default('0').transform(Number)
            }),
            response: {
                200: z.object({
                    attendees: z.array(
                        z.object({
                            id: z.number(),
                            name: z.string(),
                            email: z.string().email(),
                            createdAt: z.date(),
                            checkedIn: z.date().nullable()
                        })
                    )
                })
            }
        }
        
    }, async (req,res) => {

        const {eventId} = req.params
        const {query, pageIndex} = req.query

        const attendees = await prisma.attendee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                checkIn: {
                    select: {
                        createdAt: true
                    }
                }
            },
            where: query ? {
                eventId,
                name: {
                    contains: query
                }
            } : {
                eventId
            },
            take: 10, //itens por "pagina"
            skip: pageIndex * 10, //pular de 10 em 10
            orderBy: {
                createdAt: "desc"
            }
        })

        return res.send({
            attendees: attendees.map(attendee => {
                return {
                    id: attendee.id,
                    name: attendee.name,
                    email: attendee.email,
                    createdAt: attendee.createdAt,
                    checkedIn: attendee.checkIn?.createdAt ?? null
                }
            })
        })
    }) 
    
}