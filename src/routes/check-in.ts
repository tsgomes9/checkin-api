import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";


export async function checkIn(app:FastifyInstance){
    app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/check-in', {
        schema: {
            tags: ['attendees'],
            summary: 'create check-in attendee on event',
            params: z.object({
                attendeeId: z.coerce.number().int()
            }),
            response: {
                201: z.null()
            }
        }
    }, async (req,res) => {
        const {attendeeId} = req.params

        const attendeeCheckIn = await prisma.checkIn.findUnique({
            where: {
                attendeeId
            }
        })

        if (attendeeCheckIn !== null) {
            throw new Error('Attendee already checked in!')
        }

        await prisma.checkIn.create({
            data: {
                attendeeId
            }
        })

        return res.status(201).send()
    })
}