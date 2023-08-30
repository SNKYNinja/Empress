import { DiscordClient } from 'bot';
import {
    SlashCommandBuilder,
    ClientEvents,
    PermissionFlagsBits,
    ColorResolvable,
    AutocompleteInteraction
} from 'discord.js';
import { Player } from 'poru';

export interface ChartColorOptions {
    default: string;
    half: string;
    quarter: string;
    low: string;
    zero: string;
}

export type ObjectNameIDArray = Array[{ name: string; id: string }];

export interface ConfigInterface {
    owner: string;
    bot: {
        token: string;
    };
    guilds: ObjectNameIDArray;
}

export interface EventInterface {
    name: keyof ClientEvents;
    options: { rest: boolean; once: boolean };
    execute: (...args: any[]) => any;
}

export interface CommandInterface {
    subCommand?: string;
    data: SlashCommandBuilder | any;
    player?: boolean;
    inVc?: boolean;
    sameVc?: boolean;
    currentTrack?: boolean;
    ownerOnly?: boolean;
    autocomplete?: (...args: any[]) => any;
    execute: (...args: any[]) => any;
}

export interface SubCommandInterface {
    subCommand?: string;
    data: SlashCommandBuilder | any;
}

export interface SubCommand {
    subCommand?: string;
    player?: boolean;
    inVc?: boolean;
    sameVc?: boolean;
    currentTrack?: boolean;
    ownerOnly?: boolean;
    autocomplete?: (...args: any[]) => any;
    execute: (...args: any[]) => any;
}

export interface ButtonInterface {
    id: string;
    player?: boolean;
    inVc?: boolean;
    sameVc?: boolean;
    currentTrack?: boolean;
    execute: (...args: any[]) => any;
}

export interface SelectMenuInterface {
    id: string;
    execute: (...args: any[]) => any;
}
