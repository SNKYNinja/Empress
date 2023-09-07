import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';

import likedDb from '../../../Schemas/music/liked.db.js';

import { color, icon } from '../../../Structures/Design/design.js';
import { trimSentence } from '../../../Functions/trimSentence.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    id: 'like',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const { uri, title } = player.currentTrack.info;

        const likedData = await likedDb.findOneAndUpdate(
            { userId: interaction.user.id },
            {},
            { upsert: true, new: true }
        );

        if (likedData.tracks.some((track) => track.url === uri)) {
            const trackIndex = likedData.tracks.findIndex((track) => track.url === uri);
            likedData.tracks.splice(trackIndex, 1);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color.discord.green)
                        .setDescription(
                            `${icon.info.success} ***Track Removed ― [${trimSentence(title, 31)}](${uri})***`
                        )
                ],
                ephemeral: true
            });
        } else {
            if (likedData.tracks.length === 25)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`${icon.info.error} ***You can only save 25 tracks!***`)
                    ],
                    ephemeral: true
                });

            likedData.tracks.push({ name: title, url: uri });
            await likedData.save();

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color.discord.green)
                        .setDescription(`${icon.info.success} ***Track Saved ― [${trimSentence(title, 31)}](${uri})***`)
                ],
                ephemeral: true
            });
        }
    }
};

export default button;
