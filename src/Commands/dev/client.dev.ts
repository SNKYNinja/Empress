import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from 'discord.js';
import { CommandInterface } from 'Typings';

const command: CommandInterface = {
    ownerOnly: true,
    data: new SlashCommandBuilder().setName('manage-client').setDescription('Client configuration'),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const embed = new EmbedBuilder()
            .setColor('#2F3137')
            .setDescription(`Manage **${client.user?.username}** Client with the buttons:`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('reloadCommands')
                .setLabel('Reload Commands')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:icon_forward:1022894698911776838>'),

            new ButtonBuilder()
                .setCustomId('reloadEvents')
                .setLabel('Reload Events')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:icon_forward:1022894698911776838>')
        );

        interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};

export default command;
