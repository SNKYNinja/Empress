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
        .setName('move')
        .setDescription('Changes the position of a track')
        .setDMPermission(false)
        .addNumberOption((option) =>
            option
                .setName('track')
                .setDescription('Choose the track you want to move')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addNumberOption((option) =>
            option
                .setName('position')
                .setDescription('The position you want it to be moved')
                .setRequired(true)
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
        function moveArrayElement(arr: any[], fromIndex: number, toIndex: number) {
            arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);
            return arr;
        }

        const from = interaction.options.getNumber('track')!;
        const to = interaction.options.getNumber('position')!;

        const player = client.poru.players.get(interaction.guild!.id)!;

        if (from > player.queue.length || to > player.queue.length)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***That track doesn't exist in the queue***`)
                ],
                ephemeral: true
            });

        if (from === to)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***The position selected is the same***`)
                ]
            });

        const moved = player.queue[from - 1];
        moveArrayElement(player.queue, from - 1, to - 1);

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Moved [${moved.info.title}](${moved.info.uri}) from \`${from}\` ➜ \`${to}\`*`);

        interaction
            .reply({ embeds: [Embed] })
            .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 15000));
    }
};

export default command;
