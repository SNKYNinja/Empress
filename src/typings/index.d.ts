import { SlashCommandBuilder, ClientEvents, PermissionFlagsBits, ColorResolvable } from 'discord.js';
import { Player } from 'poru';

export interface ChartColorOptions {
    default: string;
    half: string;
    quarter: string;
    low: string;
    zero: string;
}

export interface ChartColorPallete {
    purple: ChartColorOptions;
    indigo: ChartColorOptions;
    green: ChartColorOptions;
    blurple: ChartColorOptions;
}

export type ObjectNameIDArray = Array[{ name: string; id: string }];

export interface ConfigInterface {
    bot: {
        token: string;
    };
    guilds: ObjectNameIDArray;
    colors: {
        [key: string]: ColorResolvable;
    };
    chartColors: ChartColorPallete;
    emojis: {
        [key: string]: string;
    };
}

export interface EventInterface {
    name: keyof ClientEvents;
    options: { rest: boolean; once: boolean };
    execute: (...args: any[]) => any;
}

export interface CommandInterface {
    subCommand?: string;
    data: SlashCommandBuilder | any;
    inVc?: boolean;
    sameVc?: boolean;
    currentTrack?: boolean;
    execute: (...args: any[]) => any;
}

export interface SubCommandInterface {
    subCommand?: string;
    data: SlashCommandBuilder | any;
}

export interface SubCommand {
    subCommand: string;
    execute: (...args: any[]) => any;
}

export interface ButtonInterface {
    id: string;
    execute: (...args: any[]) => any;
}

export interface PlayerExtended extends Player {
    message: Message | null;
}
