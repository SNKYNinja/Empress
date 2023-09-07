import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Track } from 'poru';
import ms from 'ms';

import EmbedPaginator from '../../../Structures/Classes/pages.js';

import { icon } from '../../../Structures/Design/design.js';

import { trimSentence } from '../../../Functions/trimSentence.js';
import { millisToMinutesAndSeconds } from '../../../Functions/msConversion.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    id: 'queue',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (!player.currentTrack.info || player.queue.length === 0)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***There are no tracks in queue!***`)
                ],
                ephemeral: true
            });

        await interaction.deferReply();

        let queueLength = 0;
        player.queue.forEach((track) => {
            queueLength += track.info.length;
        });

        const chunkSize = 5;
        let Embeds: EmbedBuilder[] = [];
        for (let i = 0; i < player.queue.length; i += chunkSize) {
            const chunk: Track[] = player.queue.slice(i, i + chunkSize);
            Embeds.push(
                new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Now Playing')
                    .setAuthor({ name: interaction.guild?.name!, iconURL: interaction.guild?.iconURL()! })
                    .setThumbnail(player.currentTrack.info.image!)
                    .setDescription(
                        `❥ [${player.currentTrack.info.title}](${
                            player.currentTrack.info.uri
                        }) [${millisToMinutesAndSeconds(player.currentTrack.info.length)}]`
                    )
                    .addFields({
                        name: `Up Next ― ${ms(queueLength, { long: true })}`,
                        value: chunk
                            .map(
                                (track, index) =>
                                    `**${i + index + 1}.** [${trimSentence(track.info.title, 31)}](${
                                        track.info.uri
                                    }) ➜ ${track.info.requester}`
                            )
                            .join('\n_ _')
                    })
            );
        }

        const paginator = new EmbedPaginator(client, interaction, Embeds);
        paginator.deferReplied = true;
        paginator.loadPages();
    }
};

export default button;
