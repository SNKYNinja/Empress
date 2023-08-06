import { DiscordClient } from 'bot.js';
import { EventInterface } from 'Typings';
import { Events, ActivityType, PresenceUpdateStatus, ActivitiesOptions } from 'discord.js';
import DB from '../../Schemas/client.db.js';

import { Player, Track } from 'poru';

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        // Status
        const statusArray: ActivitiesOptions[] = [
            {
                name: 'your Desire 💜',
                type: ActivityType.Listening
            },
            {
                name: 'over him',
                type: ActivityType.Watching
            },
            {
                name: 'Genshin Impact',
                type: ActivityType.Playing
            }
        ];

        // RAM Usage
        setInterval(async () => {
            const memoryUsage: number = process.memoryUsage().heapUsed / (1024 * 1024);

            const Data = await DB.findOneAndUpdate(
                { Client: true },
                { $push: { Memory: memoryUsage } },
                { upsert: true, new: true }
            );

            if (Data && Data.Memory.length >= 14) {
                Data.Memory.shift();
                await Data.save();
            }
        }, 30 * 1000);

        function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                client.user?.setPresence({
                    activities: [statusArray[option]],
                    status: PresenceUpdateStatus.Online
                });
            } catch (error) {
                console.error(error);
            }
        }
        setInterval(pickPresence, 15 * 1000);

        // Poru
        client.poru.init(client);
    }
};
export default event;
