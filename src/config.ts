import { ConfigInterface } from './Typings/index';
import 'dotenv/config';

export const config: ConfigInterface = {
    owner: '662898453764112408',
    bot: { token: process.env.DISCORD_TOKEN as string },
    guilds: [{ name: 'Test Server', id: '1000653435391197274' }]
};
