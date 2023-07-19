import { DiscordClient } from 'bot';
import {
    ButtonBuilder,
    ButtonInteraction,
    EmbedBuilder,
    userMention,
    ActionRowBuilder,
    ComponentType
} from 'discord.js';
import { ButtonInterface } from 'typings';

import setupDB from '../../schemas/ticket/setup.db.js';
import ticketsDB from '../../schemas/ticket/tickets.db.js';

const button: ButtonInterface = {
    id: 'claimTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const { guild, channel, user } = interaction;

        const member = guild?.members.cache.get(user.id);

        const SuccessEmbed = new EmbedBuilder().setColor('#43B383');
        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        // await interaction.deferReply();

        const setupData = await setupDB.findOne({
            guildId: guild?.id
        });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.error} ***No ticket system was found for the server***`
                    )
                ]
            });

        const ticketData = await ticketsDB.findOne({
            guildId: guild?.id,
            channelId: channel?.id
        });

        if (!ticketData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.error} ***No ticket data was found for the server***`
                    )
                ],
                ephemeral: true
            });

        if (!member?.roles.cache.hasAny(...setupData.roles))
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${client.config.emojis.error} ***Do not have enough permissions***`)
                ],
                ephemeral: true
            });

        if (user.id === ticketData.ownerId)
            return interaction.reply({
                embeds: [ErrorEmbed.setDescription(`${client.config.emojis.error} ***Cannot claim your own ticket***`)]
            });

        if (ticketData.claimed)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${client.config.emojis.error} ***Ticket has already been claimed***`)
                ],
                ephemeral: true
            });

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
        for (let component of interaction.message.components[0].components) {
            if (component.type === ComponentType.Button) {
                const button = ButtonBuilder.from(component);
                if (component.customId === 'claimTicket') button.setDisabled(true);
                buttonsRow.addComponents(button);
            }
        }

        await interaction.message.edit({ components: [buttonsRow] });

        interaction.deferUpdate();

        channel?.send({
            embeds: [
                SuccessEmbed.setDescription(
                    `${client.config.emojis.success} ***${userMention(user.id)} has claimed the ticket***`
                )
            ]
        });

        ticketData.claimed = true;
        ticketData.claimedBy = user.id;
        await ticketData.save();
    }
};

export default button;
