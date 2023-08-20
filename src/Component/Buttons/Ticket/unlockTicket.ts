import { DiscordClient } from 'bot.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    EmbedBuilder,
    TextChannel,
    userMention
} from 'discord.js';
import { ButtonInterface } from 'Typings';

import setupDB from '../../../Schemas/ticket/setup.db.js';
import ticketsDB from '../../../Schemas/ticket/tickets.db.js';
import { color, icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    id: 'unlockTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const { guild, user } = interaction;

        const member = guild?.members.cache.get(user.id);
        const channel = interaction.channel as TextChannel;

        const SuccessEmbed = new EmbedBuilder().setColor(color.discord.green);
        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        const setupData = await setupDB.findOne({
            guildId: guild?.id
        });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${icon.info.error} ***No ticket system was found for the server***`)
                ],
                ephemeral: true
            });

        const ticketData = await ticketsDB.findOne({
            guildId: guild?.id,
            channelId: channel?.id
        });

        if (!ticketData)
            return interaction.reply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***No ticket data was found for the server***`)],
                ephemeral: true
            });

        if (!member?.roles.cache.hasAny(...setupData.roles))
            return interaction.reply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Do not have enough permissions***`)],
                ephemeral: true
            });

        if (ticketData.membersId.length > 0) {
            // ticketData.membersId.forEach((m) => {
            //     channel.permissionOverwrites.edit(m, { SendMessages: false });
            // });
            Promise.all(
                ticketData.membersId.map((m) => {
                    return channel.permissionOverwrites.edit(m, { SendMessages: false });
                })
            );
        }

        const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
        for (let component of interaction.message.components[0].components) {
            if (component.type === ComponentType.Button) {
                const button = ButtonBuilder.from(component);
                if (component.customId === 'lockTicket') button.setDisabled(false);
                else if (component.customId === 'unlockTicket') button.setDisabled(true);
                buttonsRow.addComponents(button);
            }
        }

        await interaction.message.edit({ components: [buttonsRow] });

        interaction.deferUpdate();

        channel.send({
            embeds: [
                SuccessEmbed.setDescription(
                    `${icon.info.success} ***${userMention(user.id)} has unlocked this ticket***`
                )
            ]
        });

        ticketData.locked = false;
        await ticketData.save();
    }
};

export default button;
