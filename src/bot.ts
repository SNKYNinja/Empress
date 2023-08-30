import {
    ConfigInterface,
    EventInterface,
    CommandInterface,
    ObjectNameIDArray,
    ButtonInterface,
    SelectMenuInterface
} from 'Typings';
import { Client, Collection, GatewayIntentBits, Partials, version } from 'discord.js';
import { config } from './config.js';

import { connect } from 'mongoose';

import {
    SlashCommandHandler,
    ClientEventHandler,
    ComponentInteractionHandler
} from './Structures/Handlers/handlers.js';

const { loadCommands } = new SlashCommandHandler();
const { loadEvents } = new ClientEventHandler();
const { loadSelectMenus, loadButtons } = new ComponentInteractionHandler();

import chalk from 'chalk';
import Boxen from './Structures/Classes/boxen.js';

import { NodeGroup, Poru, PoruOptions } from 'poru';
import { Spotify } from 'poru-spotify';
import * as PoruEvents from './Functions/Poru/index.js';

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
    public selectMenus: Collection<string, SelectMenuInterface>;
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
        this.selectMenus = new Collection();
        this.config = config;
        this.cooldowns = new Collection();

        const nodes: NodeGroup[] = [
            // {
            //     name: 'Private Node',
            //     host: 'lavalink-replit-1.sharmilachaudh1.repl.co',
            //     port: 443,
            //     password: 'empress2305',
            //     secure: true
            // }
            {
                name: 'Public Node',
                host: 'lavalink.clxud.dev',
                port: 2333,
                password: 'youshallnotpass',
                secure: false
            }
        ];

        const poruSpotify: any = new Spotify({
            clientID: process.env.SPOTIFY_ID,
            clientSecret: process.env.SPOTIFY_SECRET
        });

        const poruOptions: PoruOptions = {
            library: 'discord.js',
            defaultPlatform: 'ytsearch',
            reconnectTries: 1
            // plugins: [poruSpotify]
        };

        this.poru = new Poru(this, nodes, poruOptions);
    }

    public async loadClient() {
        try {
            await Promise.all([
                loadCommands(this, IBox, BoxContents),
                loadEvents(this, IBox, BoxContents),
                loadButtons(this, IBox, BoxContents),
                loadSelectMenus(this, IBox, BoxContents),
                this.loadPoruEvents(),
                this.connectDatabase()
            ]);
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
                    name: `${chalk.bold.red('\nDatabase')}`,
                    value: chalk.bold.hex('#43B383')('Connected')
                });
            })
            .catch(() => {
                IBox.addItem(BoxContents, {
                    name: `${chalk.bold.red('\nDatabase')}`,
                    value: chalk.bold.hex('#f04941')('Not Connected')
                });
            });
    }

    private async loadPoruEvents() {
        const time = Date.now();
        this.poru.on('nodeConnect', async (node) => {
            await PoruEvents.nodeConnect(node, time);
        });

        this.poru.on('nodeError', PoruEvents.nodeError);

        this.poru.on('trackStart', (player, track) => {
            PoruEvents.trackStart(player, track, this);
        });

        this.poru.on('trackEnd', (player, track) => {
            PoruEvents.trackEnd(player, track, this);
        });

        this.poru.on('queueEnd', async (player) => {
            await PoruEvents.queueEnd(player, this);
        });

        this.poru.on('playerDestroy', async (player) => {
            await PoruEvents.playerDestroy(player, this);
        });

        IBox.addItem(BoxContents, {
            name: `${chalk.white('Music')}`,
            value: ' '.repeat(3) + chalk.bold.hex('#43B383')('OK')
        });
    }

    private loadErrorLog() {
        process.on('unhandledRejection', (reason, promise) => {
            console.log('   [Error_Handling] :: Unhandled Rejection/Catch');
            console.log('  ', reason, '\n  ', promise);
        });
        process.on('uncaughtException', (err, origin) => {
            console.log('   [Error_Handling] :: Uncaught Exception/Catch');
            console.log('  ', err, '\n  ', origin);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log('   [Error_Handling] :: Uncaught Exception/Catch (MONITOR)');
            console.log('  ', err, '\n  ', origin);
        });
        process.on('multipleResolves', (type, promise, reason) => {
            // console.log(" [Error_Handling] :: Multiple Resolves");
            // console.log(type, promise, reason);
        });
    }
}

new DiscordClient().loadClient();
