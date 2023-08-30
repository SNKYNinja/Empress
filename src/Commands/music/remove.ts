import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Track } from 'poru';

import { trimSentence } from '../../Functions/trimSentence.js';
import { icon } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a track from the queue')
        .addNumberOption((option) =>
            option
                .setName('track')
                .setDescription('Select the track to remove from the queue')
                .setRequired(true)
                .setAutocomplete(true)
                .setMinValue(1)
        ),
    autocomplete: (interaction: AutocompleteInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id);

        if (!player || player.queue.length === 0) return interaction.respond([]);

        const queueTracks = player.queue.map((track: Track, index) => {
            return {
                name: `${index + 1}. ${trimSentence(track.info.title, 80)}`,
                value: index + 1
            };
        });

        interaction.respond(queueTracks);
    },
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (player.queue.length === 0)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***The queue is has no tracks!***`)
                ],
                ephemeral: true
            });

        const trackNum = interaction.options.getNumber('track')!;

        if (trackNum > player.queue.length)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***That track doesn't exist in the queue***`)
                ],
                ephemeral: true
            });

        const track = player.queue[trackNum - 1];

        player.queue.remove(trackNum - 1);

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Removed ― **[${trimSentence(track.info.title, 31)}](${track.info.uri})***`);

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
