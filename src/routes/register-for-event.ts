import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvent(app: FastifyInstance) {
    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees', {
        schema: {
            tags: ['attendees'],
            summary: 'register attendee on event',
            body: z.object({
                name: z.string().min(4),
                email: z.string().email()
            }),
            params: z.object({
                eventId: z.string().uuid()
            }),
            response: {
                201: z.object({
                    attendeeId: z.number()
                })
            }
        }       
    }, async (req,res) => {
        const {eventId} = req.params
        const {name, email} = req.body

        const [event, attendeeFromEmail] = await Promise.all([ // forma de executar mais de uma promessa ao mesmo tempo (onde uma não depende da outra para executar)

            prisma.event.findUnique({
                where: {
                    id: eventId
                }
            }),

            prisma.attendee.findUnique({
                where: {
                 eventId_email: { //prop criada automaticamente pelo prisma para verificar se eventId e email estão se repetindo
                    eventId,
                    email
                 }   
                }
            })
        ])

        const amountOfAttendeesFromEvent = await prisma.attendee.count({
            where: {
                eventId
            }
        })

        if (attendeeFromEmail !== null) {
            throw new Error('This email aready exists for this event!')
        }

        if (event?.maximumAttendees && amountOfAttendeesFromEvent >= event.maximumAttendees) {
            throw new Error('Maximum attendees for this event has been reached')
        }

        const attendee = await prisma.attendee.create({
            data: {
                name,
                email,
                eventId
            }
        })

        return res.status(201).send({attendeeId:attendee.id})
    })
}