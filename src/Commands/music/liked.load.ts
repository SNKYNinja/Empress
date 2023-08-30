import { SubCommand } from 'Typings';
import { DiscordClient } from 'bot';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

import likedDb from '../../Schemas/music/liked.db.js';

const command: SubCommand = {
    inVc: true,
    sameVc: true,
    subCommand: 'liked.load',
    autocomplete: async (interaction: AutocompleteInteraction) => {
        const focused = interaction.options.getFocused();

        const likedData = await likedDb.findOne({ userId: interaction.user.id });

        if (!likedData) return interaction.respond([]);

        const filtered = likedData.tracks
            .filter((t) => t.name.includes(focused))
            .map((choice) => ({ name: `❤ ${choice.name}`, value: choice.url }));

        interaction.respond(filtered);
    },
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const trackURL = interaction.options.getString('query')!;

        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        const player =
            client.poru.players.get(interaction.guild!.id) ??
            client.poru.createConnection({
                guildId: interaction.guild!.id,
                voiceChannel: member.voice.channel!?.id,
                textChannel: interaction.channel!?.id,
                deaf: true,
                mute: false
            });

        interaction.reply(trackURL.toString());
        console.log(player);
    }
};

export default command;
