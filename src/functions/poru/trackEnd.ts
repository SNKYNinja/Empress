import { Player, Track } from 'poru';
import { DiscordClient } from 'bot.js';

export const trackEnd = (player: Player | any, track: Track, client: DiscordClient) => {
    return player.message?.delete().catch(() => {});
};
