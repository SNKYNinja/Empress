import { DiscordClient } from '../../bot.js';
import { EventInterface } from '../../typings/index.js';
import { Events, ActivityType, PresenceUpdateStatus, ActivitiesOptions } from 'discord.js';

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        console.log(`Logged in as ${client.user?.username}`);

        // Status
        const statusArray: ActivitiesOptions[] = [
            {
                name: 'your Desire 💜',
                type: ActivityType.Listening,
            },
            {
                name: 'over him',
                type: ActivityType.Watching,
            },
            {
                name: 'Genshin Impact',
                type: ActivityType.Playing,
            },
        ];

        function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                client.user?.setPresence({
                    activities: [statusArray[option]],
                    status: PresenceUpdateStatus.Online,
                });
            } catch (error) {
                console.error(error);
            }
        }
        setInterval(pickPresence, 15 * 1000);
    },
};
export default event;
