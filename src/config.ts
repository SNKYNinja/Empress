import { ConfigInterface } from './typings/index';
import { ColorResolvable } from 'discord.js';
import 'dotenv/config';

export const config: ConfigInterface = {
    bot: { token: process.env.DISCORD_TOKEN as string },
    colors: {
        theme: '#00e09e' as ColorResolvable,
        green: '#00E09E' as ColorResolvable,
        red: '#FF434E' as ColorResolvable
    },
    guilds: [{ name: 'Test Server', id: '1000653435391197274' }],
    emojis: {
        success: '<:icon_correct:1005116658978914435>',
        error: '<:icon_incorrect:1005149910280175616>',
        reply: '<:reply:1001495577093230753>'
    }
};
