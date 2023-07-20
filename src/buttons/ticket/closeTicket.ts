import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
    ComponentType,
    userMention
} from 'discord.js';
import { ButtonInterface } from 'typings';
import { createTranscript, ExportReturnType } from 'discord-html-transcripts';

import setupDB from '../../schemas/ticket/setup.db.js';
import ticketsDB from '../../schemas/ticket/tickets.db.js';

const button: ButtonInterface = {
    id: 'closeTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const { guild, user } = interaction;

        const member = guild?.members.cache.get(user.id)!;
        const channel = interaction.channel as TextChannel;

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

        if (!member.roles.cache.hasAny(...setupData.roles) && member.id !== ticketData.ownerId)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${client.config.emojis.error} ***Do not have enough permissions***`)
                ],
                ephemeral: true
            });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('deleteTicketTrue').setLabel('Yes').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('deleteTicketFalse').setLabel('No').setStyle(ButtonStyle.Danger)
        );

        const reply = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`***Are you sure you want to delete this ticket?***`)
            ],
            components: [row],
            fetchReply: true,
            ephemeral: true
        });

        Promise.all(
            ticketData.membersId.map((m) => {
                return channel.permissionOverwrites.edit(m, { SendMessages: false });
            })
        );

        const collector = reply.createMessageComponentCollector({
            time: 2 * 60 * 1000 // 2min
        });

        collector.on('collect', async (b) => {
            b.deferUpdate();

            if (b.user.id !== interaction.user.id) return;

            if (b.customId === 'deleteTicketTrue') {
                const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
                for (let component of interaction.message.components[0].components) {
                    if (component.type === ComponentType.Button) {
                        const button = ButtonBuilder.from(component).setDisabled(true);
                        buttonsRow.addComponents(button);
                    }
                }

                await interaction.message.edit({ components: [buttonsRow] });

                channel.send({
                    embeds: [
                        SuccessEmbed.setDescription(`${client.config.emojis.success} ***Ticket has been closed!***`)
                    ]
                });

                ticketData.closed = true;
                await ticketData.save();

                interaction.deleteReply();

                const owner = b.guild?.members.cache.get(ticketData.ownerId)!;
                const transcriptChannel = b.guild?.channels.cache.get(setupData.transcript)! as TextChannel;

                const attachement = await createTranscript(channel, {
                    limit: -1,
                    returnType: ExportReturnType.Attachment,
                    saveImages: true,
                    filename: `transcript-${ticketData.ticketId}-${owner.id}.html`,
                    favicon: 'guild',
                    poweredBy: false
                });

                const transcriptEmbed = new EmbedBuilder()
                    .setColor('#2F3136')
                    .setThumbnail(owner?.displayAvatarURL())
                    .setTitle('Ticket Information').setDescription(`
                        **ID:** \`${ticketData.ticketId}\`
                        **Ticket Owner:** ${userMention(owner.id)}
                        **Closed By:** ${userMention(b.user.id)}
                        **Claimed By:** ${ticketData.claimedBy ? userMention(ticketData.claimedBy) : 'None'}
                        **Created At:** <t:${ticketData.createdAt}:R>
                    `);

                transcriptChannel.send({ embeds: [transcriptEmbed], files: [attachement] });

                setTimeout(() => {
                    if (channel.deletable) channel.delete();
                }, 5 * 1000);
            } else {
                return interaction.deleteReply();
            }
        });

        collector.on('end', () => {
            return interaction.deleteReply();
        });
    }
};

export default button;
