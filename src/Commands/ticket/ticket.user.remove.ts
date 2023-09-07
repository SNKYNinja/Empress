import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { SubCommand } from 'Typings';
import { DiscordClient } from 'bot.js';

import setupDB from '../../Schemas/ticket/setup.db.js';
import ticketDB from '../../Schemas/ticket/tickets.db.js';

import { icon, color } from '../../Structures/Design/design.js';

const command: SubCommand = {
    subCommand: 'ticket.remove',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        await interaction.deferReply({ ephemeral: true });

        const setupData = await setupDB.findOne({ guildId: guild?.id });

        if (!setupData)
            return interaction.editReply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${icon.info.error} ***No ticket setup found! Use </ticket setup:1127950081685995590>***`
                    )
                ]
            });

        const ticketData = await ticketDB.findOne({ guildId: guild?.id, channelId: channel?.id });

        if (!ticketData)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***No ticket with this channel was found!***`)]
            });

        const member = guild?.members.cache.get(interaction.user.id);

        if (interaction.user.id !== ticketData.ownerId || member?.roles.cache.hasAny(...setupData.roles))
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Not authorized to use this command!***`)]
            });

        const userToAdd = interaction.options.getUser('user');

        if (!userToAdd)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Member to add was not found!***`)]
            });

        const idx = ticketData.membersId.indexOf(userToAdd.id);

        const memberToAdd = guild?.members.cache.get(userToAdd?.id!);

        if (
            !ticketData.membersId.includes(userToAdd.id) ||
            !memberToAdd?.permissionsIn(channel).has(PermissionFlagsBits.ViewChannel)
        )
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***No member found in the ticket to remove!***`)]
            });

        if (ticketData.locked)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Unlock the ticket to remove members***`)]
            });

        ticketData.membersId.splice(idx, 1);
        await ticketData.save();

        channel.permissionOverwrites.edit(userToAdd.id, {
            ViewChannel: false,
            SendMessages: false
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(color.discord.green)
                    .setDescription(`${icon.info.success} ***User was removed successfully!***`)
            ]
        });
    }
};

export default command;
