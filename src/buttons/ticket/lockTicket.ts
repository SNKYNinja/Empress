import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    EmbedBuilder,
    TextChannel,
    userMention
} from 'discord.js';
import { ButtonInterface } from 'typings';

import setupDB from '../../schemas/ticket/setup.db.js';
import ticketsDB from '../../schemas/ticket/tickets.db.js';

const button: ButtonInterface = {
    id: 'lockTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const { guild, user } = interaction;

        const member = guild?.members.cache.get(user.id);
        const channel = interaction.channel as TextChannel;

        const SuccessEmbed = new EmbedBuilder().setColor(client.config.colors.green);
        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        const setupData = await setupDB.findOne({
            guildId: guild?.id
        });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.error} ***No ticket system was found for the server***`
                    )
                ],
                ephemeral: true
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

        Promise.all(
            ticketData.membersId.map((m) => {
                return channel.permissionOverwrites.edit(m, { SendMessages: false });
            })
        );

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
        for (let component of interaction.message.components[0].components) {
            if (component.type === ComponentType.Button) {
                const button = ButtonBuilder.from(component);
                if (component.customId === 'lockTicket') button.setDisabled(true);
                else if (component.customId === 'unlockTicket') button.setDisabled(false);
                buttonsRow.addComponents(button);
            }
        }

        await interaction.message.edit({ components: [buttonsRow] });

        interaction.deferUpdate();

        channel.send({
            embeds: [
                SuccessEmbed.setDescription(
                    `${client.config.emojis.success} ***${userMention(user.id)} has locked this ticket***`
                )
            ]
        });

        ticketData.locked = true;
        await ticketData.save();
    }
};

export default button;
