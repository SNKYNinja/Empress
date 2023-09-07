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
    currentTrack: true,
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skips the current track upto the selected track from the queue')
        .setDMPermission(false)
        .addNumberOption((option) =>
            option
                .setName('track')
                .setDescription('Select the track to play immediately')
                .setRequired(true)
                .setMinValue(1)
                .setAutocomplete(true)
        ),
    autocomplete: (interaction: AutocompleteInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id);

        const focused = interaction.options.getFocused();

        if (!player || player.queue.length === 0) return interaction.respond([]);

        const queueTracks = player.queue
            .filter((track: Track) => track.info.title.startsWith(focused))
            .map((track: Track, index) => {
                return {
                    name: `${index + 1}. ${trimSentence(track.info.title, 80)}`,
                    // Here its +2 because we want to skip to the track the user provided
                    value: index + 2
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

        const to = interaction.options.getNumber('track')!;

        if (to > player.queue.length)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***That track doesn't exist in the queue***`)
                ],
                ephemeral: true
            });

        player.queue.slice(0, to - 1);
        player.stop();

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Skipped ― **${to} Track${to && ''}***`);

        interaction.reply({ embeds: [Embed] }).then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};

export default command;
