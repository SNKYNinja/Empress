import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { icon } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    inVc: true,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel for player connection')
        .setDMPermission(false),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        if (client.poru.players.get(interaction.guild!.id))
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***Player connection already exists for the server***`)
                ],
                ephemeral: true
            });

        client.poru.createConnection({
            guildId: interaction.guild!.id,
            voiceChannel: member.voice.channel!?.id,
            textChannel: interaction.channel!?.id,
            deaf: true,
            mute: false
        });

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Joined ― ${member.voice.channel}*`);

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
