import { ConfigInterface, EventInterface, CommandInterface, ObjectNameIDArray, ButtonInterface } from './typings/index';
import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Events,
    GatewayIntentBits,
    Partials
} from 'discord.js';
import { config } from './config.js';

import { fileURLToPath, pathToFileURL } from 'node:url';
import path, { dirname } from 'node:path';
import { read, readdirSync } from 'node:fs';

import { connect } from 'mongoose';
import chalk from 'chalk';

export class DiscordClient extends Client {
    public commands: Collection<string, CommandInterface>;
    public subcommands: Collection<string, CommandInterface>;
    public events: Collection<string, EventInterface>;
    public buttons: Collection<string, ButtonInterface>;
    public cooldowns: Collection<string, number>;
    public config: ConfigInterface;
    constructor() {
        super({
            intents: [
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.User
            ]
        });

        this.commands = new Collection();
        this.subcommands = new Collection();
        this.events = new Collection();
        this.buttons = new Collection();
        this.config = config;
        this.cooldowns = new Collection();
    }

    public async loadClient() {
        try {
            await this.loadCommands();
            await this.loadEvents();
            await this.loadButtons();
            this.connectDatabase(process.env.DATABASE_URL);
            this.loadErrorLog();

            this.login(this.config.bot.token);
        } catch (error) {
            console.error(chalk.red.bold(`[Load Client Error]`), error);
        }
    }

    private async connectDatabase(databaseURL: string) {
        connect(databaseURL).then(() => {
            console.log(`${chalk.blueBright.bold('[INFO]')} Database Connected!`);
        });
    }

    private async loadCommands() {
        let commandsArray: Array<ApplicationCommandDataResolvable> = [];
        let commandsDevArray: Array<ApplicationCommandDataResolvable> = [];

        await Promise.all(
            readdirSync(`${dirname(fileURLToPath(import.meta.url))}/commands`).map(async (folder) => {
                await Promise.all(
                    readdirSync(`${dirname(fileURLToPath(import.meta.url))}/commands/${folder}`)
                        .filter((file) => file.endsWith('.js' || '.ts'))
                        .map(async (file) => {
                            const command: CommandInterface = (
                                await import(
                                    `${pathToFileURL(
                                        path.resolve(
                                            `${dirname(fileURLToPath(import.meta.url))}/commands/${folder}/${file}`
                                        )
                                    )}`
                                )
                            ).default;

                            if (command.subCommand) return this.subcommands.set(command.subCommand, command);

                            this.commands.set(command.data.name, command);
                            if (file.endsWith('.dev.ts') || file.endsWith('.dev.js')) {
                                commandsDevArray.push(command.data.toJSON());
                            } else {
                                commandsArray.push(command.data.toJSON());
                            }
                        })
                );
            })
        );

        this.on(Events.ClientReady, async () => {
            this.application?.commands.set(commandsArray);

            if (this.config.guilds)
                this.config.guilds.forEach(async (guild: ObjectNameIDArray) => {
                    await this.guilds.cache.get(guild.id)?.commands.set(commandsDevArray);
                });
        });
    }

    private async loadEvents() {
        await Promise.all(
            readdirSync(`${dirname(fileURLToPath(import.meta.url))}/events`).map(async (folder) => {
                await Promise.all(
                    readdirSync(`${dirname(fileURLToPath(import.meta.url))}/events/${folder}`)
                        .filter((file) => file.endsWith('.js' || '.ts'))
                        .map(async (file) => {
                            const event: EventInterface = (
                                await import(
                                    `${pathToFileURL(
                                        path.resolve(
                                            `${dirname(fileURLToPath(import.meta.url))}/events/${folder}/${file}`
                                        )
                                    )}`
                                )
                            ).default;

                            if (event.options?.once) {
                                this.once(event.name as keyof ClientEvents, (...args) => event.execute(...args, this));
                            } else {
                                this.on(event.name as keyof ClientEvents, (...args) => event.execute(...args, this));
                            }

                            this.events.set(event.name, event);
                        })
                );
            })
        );
    }

    private async loadButtons() {
        const buttonsDirectory = `${dirname(fileURLToPath(import.meta.url))}/buttons`;

        try {
            if (!readdirSync(buttonsDirectory)) return;
        } catch (e: any) {
            return;
        }

        await Promise.all(
            readdirSync(buttonsDirectory).map(async (folder) => {
                await Promise.all(
                    readdirSync(`${buttonsDirectory}/${folder}`)
                        .filter((file) => file.endsWith('.js' || '.ts'))
                        .map(async (file) => {
                            const button: ButtonInterface = (
                                await import(`${pathToFileURL(path.resolve(`${buttonsDirectory}/${folder}/${file}`))}`)
                            ).default;

                            this.buttons.set(button.id, button);
                        })
                );
            })
        );
    }

    private loadErrorLog() {
        process.on('unhandledRejection', (reason, promise) => {
            console.log(' [Error_Handling] :: Unhandled Rejection/Catch');
            console.log(reason, '\n', promise);
        });
        process.on('uncaughtException', (err, origin) => {
            console.log(' [Error_Handling] :: Uncaught Exception/Catch');
            console.log(err, '\n', origin);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(' [Error_Handling] :: Uncaught Exception/Catch (MONITOR)');
            console.log(err, '\n', origin);
        });
        process.on('multipleResolves', (type, promise, reason) => {
            // console.log(" [Error_Handling] :: Multiple Resolves");
            // console.log(type, promise, reason);
        });
    }
}

new DiscordClient().loadClient();
