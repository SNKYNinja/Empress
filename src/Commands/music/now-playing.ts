import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { millisToMinutesAndSeconds } from '../../Functions/msConversion.js';

import { musicCard } from 'musicard';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    data: new SlashCommandBuilder()
        .setName('now-playing')
        .setDescription('Display the current playing track')
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();

        const player = client.poru.players.get(interaction.guild!.id)!;

        const track = player.currentTrack.info!;

        const card = new musicCard()
            .setName(track.title)
            .setAuthor(track.author)
            .setThumbnail(
                track.image ?? 'https://cdn.dribbble.com/users/3547568/screenshots/14395014/music_jpeg_4x.jpg'
            )
            .setColor('auto')
            .setProgress(Math.floor((player!.position / track.length) * 100))
            .setStartTime('0:00')
            .setEndTime(millisToMinutesAndSeconds(track.length))
            .setBrightness(100);

        const attachment = new AttachmentBuilder(await card.build(), { name: 'now-playing.png' });

        interaction.editReply({ files: [attachment] });
    }
};

export default command;
