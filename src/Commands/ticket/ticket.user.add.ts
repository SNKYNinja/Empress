import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { SubCommand } from 'Typings';
import { DiscordClient } from 'bot.js';

import setupDB from '../../Schemas/ticket/setup.db.js';
import ticketDB from '../../Schemas/ticket/tickets.db.js';

import { icon, color } from '../../Structures/Design/design.js';

const command: SubCommand = {
    subCommand: 'ticket.add',
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

        if (ticketData.membersId.length === 4)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Cannot add more members to the ticket!***`)]
            });

        const userToAdd = interaction.options.getUser('user');

        if (!userToAdd)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Member to add was not found!***`)]
            });

        const memberToAdd = guild?.members.cache.get(userToAdd.id);

        if (memberToAdd?.permissionsIn(channel).has(PermissionFlagsBits.ViewChannel))
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Member already exists in the ticket!***`)]
            });

        if (ticketData.locked)
            return interaction.editReply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Unlock the ticket to add members!***`)]
            });

        ticketData.membersId.push(userToAdd.id);
        await ticketData.save();

        channel.permissionOverwrites.edit(userToAdd.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(color.discord.green)
                    .setDescription(`${icon.info.success} ***User was added successfully!***`)
            ]
        });
    }
};

export default command;
