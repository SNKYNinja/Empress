import { ConfigInterface, EventInterface, CommandInterface, ObjectNameIDArray, ButtonInterface } from './typings/index';
import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Events,
    GatewayIntentBits,
    Partials,
    version
} from 'discord.js';
import { config } from './config.js';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import path from 'path';
import { chownSync, readdirSync } from 'node:fs';

import { Poru, PoruOptions, PoruEvents, Player, Track } from 'poru';
import { Spotify } from 'poru-spotify';

import { connect } from 'mongoose';

import chalk from 'chalk';
import Boxen from './classes/boxen.js';

import { glob } from 'glob';

import { nodeConnect } from './poru/nodeConnect.js';
import { trackStart } from './poru/trackStart.js';
import { trackEnd } from './poru/trackEnd.js';

const IBox = new Boxen();
const BoxContents = await IBox.createBox();
IBox.addItem(BoxContents, {
    name: `${chalk.bold.hex('#5865F2')('Discord.js')}`,
    value: `v${version}\n`
});

export class DiscordClient extends Client {
    public commands: Collection<string, CommandInterface>;
    public subcommands: Collection<string, CommandInterface>;
    public events: Collection<string, EventInterface>;
    public buttons: Collection<string, ButtonInterface>;
    public cooldowns: Collection<string, number>;
    public config: ConfigInterface;
    public poru: Poru;
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

        const nodes = [
            {
                name: 'NODE-1',
                host: 'us.pylex.me',
                port: 8857,
                password: 'youshallnotpass',
                secure: false
            },
            {
                name: 'NODE-2',
                host: 'node1.lewdhutao.tech',
                port: 1183,
                password: 'lewdhutao',
                secure: false
            }
        ];

        // const poruSpotify = new Spotify({
        //     clientID: process.env.SPOTIFY_ID,
        //     clientSecret: process.env.SPOTIFY_SECRET
        // });

        const poruOptions: PoruOptions = {
            library: 'discord.js',
            defaultPlatform: 'ytsearch',
            reconnectTries: 5
            // plugins: [poruSpotify]
        };

        this.poru = new Poru(this, nodes, poruOptions);
    }

    public async loadClient() {
        try {
            await this.connectDatabase();
            await this.loadCommands();
            await this.loadEvents();
            await this.loadButtons();
            await this.loadPoruEvents();
            this.loadErrorLog();

            await this.login(this.config.bot.token)
                .then(() => {
                    IBox.addItemStart(BoxContents, {
                        name: `${this.user?.username} ${chalk.bold.hex('#4bff54')('• ONLINE')}\n`
                    });
                })
                .catch((err) => {
                    IBox.addItemStart(BoxContents, {
                        name: `${this.user?.username} ${chalk.bold.hex('#f04941')('• OFFLINE')}\n`
                    });

                    IBox.addItem(BoxContents, {
                        name: chalk.hex('#f04941')(err.name)
                    });
                });

            await IBox.showBox(BoxContents, {
                borderColor: 'white',
                borderStyle: 'round',
                textAlignment: 'center',
                dimBorder: true,
                padding: 1,
                margin: 1
            });
        } catch (error) {
            console.error(chalk.red.bold(`[Load Client Error]`), error);
        }
    }

    private async connectDatabase() {
        await connect(process.env.DATABASE_URL)
            .then(() => {
                IBox.addItem(BoxContents, {
                    name: `${chalk.bold.red('Database')}`,
                    value: chalk.bold.hex('#43B383')('Connected\n')
                });
            })
            .catch(() => {
                IBox.addItem(BoxContents, {
                    name: `${chalk.bold.red('Database')}`,
                    value: chalk.bold.hex('#f04941')('Not Connected\n')
                });
            });
    }

    private async loadCommands() {
        try {
            let commandsArray: Array<ApplicationCommandDataResolvable> = [];
            let commandsDevArray: Array<ApplicationCommandDataResolvable> = [];
            let commandStatus: string = chalk.bold.hex('#43B383')('OK');

            const CmdsDir = await glob(`${process.cwd()}/dist/commands/*/*{.ts,.js}`);
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

                    if (command.subCommand) return this.subcommands.set(command.subCommand, command);

                    if (file.endsWith('.dev.ts') || file.endsWith('.dev.js')) {
                        commandsDevArray.push(command.data.toJSON());
                        this.commands.set(command.data.name, command);
                    } else {
                        commandsArray.push(command.data.toJSON());
                        this.commands.set(command.data.name, command);
                    }
                })
            );

            IBox.addItem(BoxContents, {
                name: `${chalk.white('Commands')}`,
                value: commandStatus
            });

            // Register Commands
            this.on(Events.ClientReady, async () => {
                // Public Commands
                this.application?.commands.set(commandsArray);

                // Dev Commands
                this.config.guilds.forEach(async (guild) => {
                    await this.guilds.cache.get(guild.id)?.commands.set(commandsDevArray);
                });
            });
        } catch (err) {
            console.log(err);
        }
    }

    private async loadEvents() {
        const EventsDir = await glob(`${process.cwd()}/dist/events/*/*{.ts,.js}`);
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
                    this.once(event.name, (...args) => event.execute(...args, this));
                } else {
                    this.on(event.name, (...args) => event.execute(...args, this));
                }

                // Event Collection
                this.events.set(event.name, event);
            })
        );

        IBox.addItem(BoxContents, {
            name: `${chalk.white('Events')}`,
            value: ' '.repeat(2) + eventStatus
        });
    }

    private async loadButtons() {
        const ButtonDir = await glob(`${process.cwd()}/dist/buttons/*/*{.ts,.js}`);
        let buttonStatus: string = chalk.bold.hex('#43B383')('OK');

        await Promise.all(
            ButtonDir.map(async (file) => {
                const buttonPath = path.resolve(file);
                const button: ButtonInterface = (await import(`${pathToFileURL(buttonPath)}`)).default;

                if (!button) {
                    buttonStatus = `${chalk.bold.red('Failed')} ${chalk.underline(
                        file.split('\\').slice(2).join('/')
                    )}`;
                    return;
                }

                this.buttons.set(button.id, button);
            })
        );

        IBox.addItem(BoxContents, {
            name: `${chalk.white('Buttons')}`,
            value: ' ' + buttonStatus
        });
    }

    private async loadPoruEvents() {
        this.poru.on('nodeConnect', nodeConnect);

        this.poru.on('trackStart', (player, track) => {
            const playerExtended = Object.assign(player, { message: null });
            trackStart(playerExtended, track, this);
        });

        this.poru.on('trackEnd', (player, track) => {
            const playerExtended = Object.assign(player, { message: null });
            trackEnd(playerExtended, track, this);
        });

        IBox.addItem(BoxContents, {
            name: `${chalk.white('Music')}`,
            value: ' '.repeat(3) + chalk.bold.hex('#43B383')('OK\n')
        });
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
