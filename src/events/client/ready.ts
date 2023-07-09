import { DiscordClient } from '../../bot.js';
import { EventInterface } from '../../typings/index.js';
import { Events, ActivityType, PresenceUpdateStatus, ActivitiesOptions } from 'discord.js';
import chalk from 'chalk';
import DB from '../../schemas/clientDB.js';
import boxen from 'boxen';

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        console.log(`${chalk.greenBright.bold('[INFO]')} Logged in as ${client.user?.username}`);
        // console.log(
        //     boxen('Empress Logged In', {
        //         padding: { left: 5, right: 5, top: 2, bottom: 2 },
        //         width: 50,
        //         borderColor: 'greenBright',
        //         align: 'center',
        //         dimBorder: true
        //     })
        // );

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
        }, 5 * 1000);

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
    }
};
export default event;
