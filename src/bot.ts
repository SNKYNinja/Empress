import { ConfigInterface, EventInterface, CommandInterface, ObjectNameIDArray, ButtonInterface } from './Typings/index';
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

import { glob } from 'glob';
import { pathToFileURL } from 'node:url';
import path from 'path';

import { connect } from 'mongoose';

import chalk from 'chalk';
import Boxen from './Structure/Classes/boxen.js';
// import Logger from './classes/logger.js';
// const logger = new Logger();

import { Poru, PoruOptions } from 'poru';
import { Spotify } from 'poru-spotify';
import { nodeConnect, trackStart, trackEnd, queueEnd, nodeError } from './Functions/Poru/index.js';

const IBox = new Boxen();
const BoxContents = await IBox.createBox();
IBox.addItems(BoxContents, [
    {
        name: chalk.bold.hex('#5865F2')('Discord.js'),
        value: `v${version}`
    },
    {
        name: chalk.bold.hex('#5865F2')('Node.js'),
        value: `${process.version}\n`
    }
]);

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
                name: 'Private Node',
                host: 'us.pylex.me',
                port: 8857,
                password: 'empress2305',
                secure: false
            },
            {
                name: 'Public Node',
                host: 'lavalink.clxud.dev',
                port: 2333,
                password: 'youshallnotpass',
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
            reconnectTries: 0
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

            console.clear();
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

    public async loadCommands() {
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

    public async loadEvents() {
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
        const ButtonDir = await glob(`${process.cwd()}/dist/Component/Buttons/*/*{.ts,.js}`);
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
        const time = Date.now();
        this.poru.on('nodeConnect', (node) => {
            nodeConnect(node, time);
        });

        this.poru.on('nodeError', nodeError);

        this.poru.on('trackStart', (player, track) => {
            trackStart(player, track, this);
        });

        this.poru.on('trackEnd', (player, track) => {
            trackEnd(player, track, this);
        });

        this.poru.on('queueEnd', (player) => {
            queueEnd(player, this);
        });

        IBox.addItem(BoxContents, {
            name: `${chalk.white('Music')}`,
            value: ' '.repeat(3) + chalk.bold.hex('#43B383')('OK')
        });
    }

    private loadErrorLog() {
        process.on('unhandledRejection', (reason, promise) => {
            console.log('   [Error_Handling] :: Unhandled Rejection/Catch');
            console.log(reason, '\n', promise);
        });
        process.on('uncaughtException', (err, origin) => {
            console.log('   [Error_Handling] :: Uncaught Exception/Catch');
            console.log(err, '\n', origin);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log('   [Error_Handling] :: Uncaught Exception/Catch (MONITOR)');
            console.log(err, '\n', origin);
        });
        process.on('multipleResolves', (type, promise, reason) => {
            // console.log(" [Error_Handling] :: Multiple Resolves");
            // console.log(type, promise, reason);
        });
    }
}

new DiscordClient().loadClient();
