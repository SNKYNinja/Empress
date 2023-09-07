import { DiscordClient } from 'bot.js';
import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { CommandInterface } from 'Typings';

import { millisToMinutesAndSeconds } from '../../Functions/msConversion.js';
import { trimSentence } from '../../Functions/trimSentence.js';
import { icon } from '../../Structures/Design/design.js';

const discImage =
    'https://images-ext-1.discordapp.net/external/yUriWKmnxsxRh1WW2fjW7wf25i_ZX2jj60SyCoOULDs/https/cdn.darrennathanael.com/icons/spinning_disk.gif';

const command: CommandInterface = {
    inVc: true,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a track')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('The track which you want to play')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const query = interaction.options.getString('query')!;

        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        const player =
            client.poru.players.get(interaction.guild!.id) ??
            client.poru.createConnection({
                guildId: interaction.guild!.id,
                voiceChannel: member.voice.channel!?.id,
                textChannel: interaction.channel!?.id,
                deaf: true,
                mute: false
            });

        await interaction.deferReply();

        const { loadType, tracks, playlistInfo } = await client.poru.resolve({
            query: query,
            source: 'ytsearch',
            requester: member
        });

        const Embed = new EmbedBuilder().setAuthor({ name: 'Added to Queue', iconURL: discImage }).setColor('Blue');

        if (loadType === 'PLAYLIST_LOADED') {
            // Adding Playlist tracks to queue
            for (const track of tracks) {
                track.info.requester = interaction.member;
            }

            player.queue.push(...tracks);

            // Setting Reply Embed
            const replyEmbed = Embed.setDescription(
                `<:icon_forward:1022894698911776838> **${tracks.length}** tracks from **[${playlistInfo.name}](${query})**`
            );

            await interaction.editReply({
                embeds: [replyEmbed]
            });

            if (!player.isPlaying && !player.isPaused) return player.play();
        } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
            // Importing 1st Result of the Searches
            const track = tracks.shift()!;
            track.info.requester = interaction.member;

            player.queue.add(track);
            const { image, title, uri, requester, length } = track.info;

            // Setting Reply Embed
            let replyEmbed = Embed.setThumbnail(image!)
                .setDescription(`[${trimSentence(title, 31)}](${uri})`)
                .addFields(
                    { name: '`✦` Added By', value: `<@${requester.id}>`, inline: true },
                    { name: '`✦` Duration', value: `\`\`${millisToMinutesAndSeconds(length)}\`\``, inline: true }
                );

            await interaction.editReply({
                embeds: [replyEmbed]
            });

            if (!player.isPlaying && !player.isPaused) return player.play();
        } else {
            // Error Embed for Invalid Results
            interaction.editReply({
                embeds: [
                    ErrorEmbed.setDescription(`${icon.info.error} ***There were no results found for your query!***`)
                ]
            });
        }
    }
};

export default command;
