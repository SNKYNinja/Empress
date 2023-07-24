import { Player, Track } from 'poru';
import { DiscordClient } from '../bot.js';
import { PlayerExtended } from '../typings/index.js';

export const trackEnd = (player: PlayerExtended, track: Track, client: DiscordClient) => {
    return player.message?.delete().catch((err) => console.log(err));
};
