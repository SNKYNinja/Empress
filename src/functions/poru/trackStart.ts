import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { millisToMinutesAndSeconds } from '../msConversion.js';
import { trimSentence } from '../trimSentence.js';
import { Track, Player } from 'poru';
import { DiscordClient } from '../../bot.js';

export const trackStart = (player: Player | any, track: Track, client: DiscordClient) => {
    // Required Variables //
    const source = capitalizeFirstLetter(track.info.sourceName)
        .replace('Youtube', 'Youtube ― <:icon_youtube:1032911572739293194>')
        .replace('Spotify', 'Spotify ― <:icon_spotify:1032911570013016094>');

    let nextTrack = player.queue[0]?.info;
    nextTrack = nextTrack ? `[${trimSentence(nextTrack.title, 31)}](${nextTrack.uri})` : 'None';

    let loopEmoji: string;

    if (player.loop == 'TRACK') {
        loopEmoji = '<:loop_once:1072180421598650448>';
    } else if (player.loop == 'QUEUE') {
        loopEmoji = '<:loop_queue:1072180901364113539>';
    } else {
        loopEmoji = '<:loop_button:1039487431709311026>';
    }

    // Player Building
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('loop').setEmoji(loopEmoji).setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('<:backward_button:1039487425673703465>')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!player.previousTrack),

        new ButtonBuilder().setCustomId('p/p').setEmoji(`<:pause:1034451169839423518>`).setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji('<:forward_button:1039490411502239795>')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('playlist')
            .setEmoji('<:musicplaylist:1072406459205308417>')
            .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji('<:disconnect:1053965567125630986>')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji('<:shuffle:1043451836327284748>')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('like')
            .setEmoji('<:like_button:1039166303354769459>')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('repeat')
            .setEmoji('<:repeatbutton:1043455287950069830>')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('queue')
            .setEmoji('<:queue:1043460026062344263>')
            .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Now Playing`,
            iconURL:
                'https://images-ext-1.discordapp.net/external/yUriWKmnxsxRh1WW2fjW7wf25i_ZX2jj60SyCoOULDs/https/cdn.darrennathanael.com/icons/spinning_disk.gif'
        })
        .setColor('Blue')
        .setDescription(
            `
      **[${track.info.title}](${track.info.uri})**
      _ _
      **\`〣\` Next Track ―** ${nextTrack}

      `
        )
        .addFields(
            {
                name: '`✦` Author',
                value: `<:reply:1001495577093230753> ` + track.info.author.split(',').join(', '),
                inline: true
            },
            { name: '`✦` Source', value: `<:reply:1001495577093230753> ` + source, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            {
                name: '`✦` Requested By',
                value: `<:reply:1001495577093230753> ` + `<@${track.info.requester?.id}>`,
                inline: true
            },
            {
                name: '`✦` Duration',
                value: `<:reply:1001495577093230753> ` + `\`${millisToMinutesAndSeconds(track.info.length)}\``,
                inline: true
            },
            { name: '\u200B', value: '\u200B', inline: true }
        );

    if (track.info.sourceName === 'youtube') {
        embed.setImage(track.info.image!);
    } else embed.setThumbnail(track.info.image!);

    const channel = client.channels.cache.get(player.textChannel) as TextChannel;

    player.message?.delete().catch(() => null);

    channel?.send({ embeds: [embed], components: [row, row2] }).then((x) => {
        player.message = x;
    });
};

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
