import { DiscordClient } from 'bot.js';
import { EventInterface } from 'Typings';
import { Events, ActivityType, PresenceUpdateStatus, ActivitiesOptions } from 'discord.js';
import DB from '../../Schemas/client.db.js';

import { Player, Track } from 'poru';

import Imap from 'node-imap';
import { inspect } from 'util';

import ConsoleLogger from '../../Structures/Classes/logger.js';
const logger = new ConsoleLogger();

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

        // Mail Listener
        // const imap = new Imap({
        //     user: process.env.GMAIL_USER,
        //     password: process.env.GMAIL_APP_PASSWORD,
        //     host: 'imap.gmail.com',
        //     port: 993,
        //     tls: true
        // });

        // function openInbox(callback: any) {
        //     imap.openBox('INBOX', true, callback);
        // }

        // imap.once('ready', () => {
        //     logger.info('Imap Connected');
        //     openInbox((err: any, box: Imap.Box) => {
        //         if (err) throw err;
        //         imap.on('mail', (num) => {
        //             logger.info(`You have ${num} new messages!`);
        //             const f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM)', 'TEXT'] });

        //             f.on('message', (msg, seqno) => {
        //                 const prefix = `(#${seqno}) `;
        //                 msg.on('body', (stream, info) => {
        //                     console.log('Value of info.which:', inspect(info.which));
        //                     if (info.which === 'TEXT')
        //                         console.log(prefix + `Body [${inspect(info.which)}] found, ${info.size} total bytes`);
        //                     let buffer = '',
        //                         count = 0;
        //                     stream.on('data', (chunk) => {
        //                         count += chunk.length;
        //                         buffer += chunk.toString('utf8');

        //                         if (info.which === 'TEXT')
        //                             console.log(prefix + `Body [${inspect(info.which)}] (${count}/${info.size})`);
        //                     });
        //                     stream.once('end', () => {
        //                         if (info.which !== 'TEXT')
        //                             console.log(prefix + `Parsed header: ${inspect(Imap.parseHeader(buffer))}`);
        //                         else {
        //                             console.log(prefix + `Body ${inspect(info.which)} Finished\n`, 'Buffer:');
        //                             console.dir(buffer);
        //                         }
        //                     });
        //                 });
        //                 msg.once('attributes', function (attrs) {
        //                     console.log(prefix + `Attributes: ${inspect(attrs, false, 8)}`);
        //                 });
        //                 msg.once('end', function () {
        //                     console.log(prefix + 'Finished');
        //                 });
        //             });
        //         });
        //     });
        // });

        // imap.once('error', function (err) {
        //     logger.error(err);
        // });

        // imap.once('end', function () {
        //     logger.error('Imap Disconnected');
        // });

        // imap.connect();

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
