import { ConfigInterface } from './typings/index';
import { ColorResolvable } from 'discord.js';
import 'dotenv/config';

export const config: ConfigInterface = {
    bot: { token: process.env.DISCORD_TOKEN as string },
    colors: {
        theme: '#00e09e' as ColorResolvable,
        green: '#43B383' as ColorResolvable,
        red: '#FF434E' as ColorResolvable
    },
    chartColors: {
        purple: {
            default: 'rgba(149, 76, 233, 1)',
            half: 'rgba(149, 76, 233, 0.5)',
            quarter: 'rgba(149, 76, 233, 0.25)',
            low: 'rgba(149, 76, 233, 0.1)',
            zero: 'rgba(149, 76, 233, 0)'
        },
        indigo: {
            default: 'rgba(80, 102, 120, 1)',
            half: 'rgba(80, 102, 120, 0.5)',
            quarter: 'rgba(80, 102, 120, 0.25)',
            low: 'rgba(80, 102, 120, 0.1)',
            zero: 'rgba(80, 102, 120, 0)'
        },
        green: {
            default: 'rgba(92, 221, 139, 1)',
            half: 'rgba(92, 221, 139, 0.5)',
            quarter: 'rgba(92, 221, 139, 0.25)',
            low: 'rgba(92, 221, 139, 0.1)',
            zero: 'rgba(92, 221, 139, 0)'
        },
        blurple: {
            default: 'rgba(88, 101, 242, 1)',
            half: 'rgba(88, 101, 242, 0.5)',
            quarter: 'rgba(88, 101, 242, 0.25)',
            low: 'rgba(88, 101, 242, 0.1)',
            zero: 'rgba(88, 101, 242, 0)'
        }
    },
    guilds: [{ name: 'Test Server', id: '1000653435391197274' }],
    emojis: {
        success: '<:icon_correct:1005116658978914435>',
        error: '<:icon_incorrect:1005149910280175616>',
        reply: '<:reply:1001495577093230753>',
        greenTick: '<:green_check:1048266995008806972>',
        redCross: '<:red_cross:1048305078651605072>',
        announce: '<:blurple_announcement:1030340123788836955>'
    }
};
