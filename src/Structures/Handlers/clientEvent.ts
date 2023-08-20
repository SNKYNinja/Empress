import { EventInterface } from 'Typings';
import { DiscordClient } from 'bot';

import { glob } from 'glob';
import { pathToFileURL } from 'node:url';
import path from 'path';

import Boxen from 'Structures/Classes/boxen';
import chalk from 'chalk';

export class ClientEventHandler {
    constructor() {}

    public async loadEvents(client: DiscordClient, IBox?: Boxen, BoxContents?: string[]) {
        const EventsDir = await glob(`${process.cwd()}/dist/Events/*/*{.ts,.js}`);
        let eventStatus: string = chalk.bold.hex('#43B383')('OK');

        await Promise.all(
            EventsDir.map(async (file) => {
                const eventPath = path.resolve(file);
                const event: EventInterface = (await import(`${pathToFileURL(eventPath)}`)).default;

                if (!event) {
                    eventStatus = `${chalk.bold.red(' Failed')} ${chalk.underline(
                        file.split('\\').slice(2).join('/')
                    )}`;
                    return;
                }

                // Set Events
                if (event.options?.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }

                // Event Collection
                client.events.set(event.name, event);
            })
        );

        if (IBox && BoxContents) {
            IBox.addItem(BoxContents, {
                name: `${chalk.white('Events')}`,
                value: ' '.repeat(2) + eventStatus
            });
        }
    }
}
