import { DiscordClient } from '../../bot';
import { AutocompleteInteraction, Events } from 'discord.js';
import { EventInterface } from 'Typings';

import { Client } from 'genius-lyrics';
export const geniusClient = new Client(process.env.GENIUS_SECRET);

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { rest: false, once: false },
    execute: async (interaction: AutocompleteInteraction, client: DiscordClient) => {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== 'lyrics') return;

        const focused = interaction.options.getFocused();

        const searches = await geniusClient.songs.search(focused);

        interaction.respond(
            searches
                .filter((song) => song.title.length + song.artist.name.length + 3 <= 100)
                .map((song) => ({
                    name: `${song.title} ― ${song.artist.name}`,
                    value: song.id.toString()
                }))
        );
    }
};

export default event;
