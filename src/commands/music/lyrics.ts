import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ThreadAutoArchiveDuration } from 'discord.js';
import { CommandInterface } from 'typings';

import { geniusClient } from '../../events/autocomplete/lyrics.auto.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for a command')
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Search the music track for lyrics')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const songId = interaction.options.getString('query');

        await interaction.deferReply();

        try {
            const song = await geniusClient.songs.get(parseInt(songId!));
            const lyrics = await song.lyrics();

            const Embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle(`${song.title} ― ${song.artist.name}`)
                .setURL(song.url)
                .setThumbnail(song.image)
                .setDescription(lyrics)
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
                .setAuthor({
                    name: 'Powered by Genius',
                    iconURL: 'https://images.rapgenius.com/365f0e9e7e66a120867b7b0ff340264a.750x750x1.png',
                    url: 'https://genius.com/'
                });

            const message = await interaction.editReply(
                `*<:blurple_link:1030340037050646578> [${song.title}](<${song.url}>) • Lyrics*`
            );

            message
                .startThread({
                    name: `${song.title} ― Lyrics`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    reason: 'Lyrics'
                })
                .then((thread) => {
                    thread.send({
                        embeds: [Embed]
                    });

                    thread.setLocked(true);

                    setTimeout(async () => await thread?.delete(), 30 * 60 * 1000);
                });
        } catch (err) {
            console.log(err);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${client.config.emojis.error} ***Could not load lyrics for the query track!***`
                        )
                ]
            });
        }
    }
};

export default command;
