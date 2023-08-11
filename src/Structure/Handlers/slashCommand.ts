import { ApplicationCommandDataResolvable, Events } from 'discord.js';
import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot.js';

import { glob } from 'glob';
import { pathToFileURL } from 'node:url';
import path from 'path';

import Boxen from '../Classes/boxen.js';
import chalk from 'chalk';

export class SlashCommandHandler {
    constructor() {}

    public async loadCommands(client: DiscordClient, IBox?: Boxen, BoxContents?: string[]) {
        try {
            let commandsArray: Array<ApplicationCommandDataResolvable> = [];
            let commandsDevArray: Array<ApplicationCommandDataResolvable> = [];
            let commandStatus: string = chalk.bold.hex('#43B383')('OK');

            const CmdsDir = await glob(`${process.cwd()}/dist/Commands/*/*{.ts,.js}`);
            await Promise.all(
                CmdsDir.map(async (file) => {
                    const commandPath = path.resolve(file);
                    const command: CommandInterface = (await import(`${pathToFileURL(commandPath)}`)).default;

                    if (!command) {
                        commandStatus = `${chalk.bold.red('Failed')} ${chalk.underline(
                            file.split('\\').slice(2).join('/')
                        )}`;
                        return;
                    }

                    if (command.subCommand) return client.subcommands.set(command.subCommand, command);

                    if (file.endsWith('.dev.ts') || file.endsWith('.dev.js')) {
                        commandsDevArray.push(command.data.toJSON());
                        client.commands.set(command.data.name, command);
                    } else {
                        commandsArray.push(command.data.toJSON());
                        client.commands.set(command.data.name, command);
                    }
                })
            );

            if (IBox && BoxContents) {
                IBox.addItem(BoxContents, {
                    name: `${chalk.white('Commands')}`,
                    value: commandStatus
                });
            }

            // Register Commands
            client.on(Events.ClientReady, async () => {
                // Public Commands
                client.application?.commands.set(commandsArray);

                // Dev Commands
                client.config.guilds.forEach(async (guild) => {
                    await client.guilds.cache.get(guild.id)?.commands.set(commandsDevArray);
                });
            });
        } catch (err) {
            console.log(err);
        }
    }
}
