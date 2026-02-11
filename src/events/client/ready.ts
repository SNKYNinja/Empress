import { DiscordClient } from "@/bot"
import { Events } from "discord.js"
import { prisma } from "@/lib/db"
import { EventInterface } from "@/typings"

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        client.poru.init()

        // store ram usage
        setInterval(async () => {
            const memUsage = process.memoryUsage().heapUsed / (1024 * 1024);

            const existing = await prisma.client.findUnique({ where: { id: 1 } });
            const memory = [...(existing?.memory ?? []), memUsage];

            if (memory.length >= 14) memory.shift();

            await prisma.client.upsert({
                where: { id: 1 },
                update: { memory },
                create: { id: 1, memory: [memUsage] },
            });
        }, 30 * 1000); // every 30 secs
    }
}

export default event
