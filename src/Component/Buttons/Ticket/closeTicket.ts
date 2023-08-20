import { DiscordClient } from 'bot.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
    ComponentType,
    userMention,
    AttachmentBuilder
} from 'discord.js';
import { ButtonInterface } from 'Typings';

import { createTranscript, ExportReturnType } from 'discord-html-transcripts';
import prettier from 'prettier';

import setupDB from '../../../Schemas/ticket/setup.db.js';
import ticketsDB from '../../../Schemas/ticket/tickets.db.js';
import { color, icon } from '../../../Structures/Design/design.js';

const button: ButtonInterface = {
    id: 'closeTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const { guild, user } = interaction;

        const member = guild?.members.cache.get(user.id)!;
        const channel = interaction.channel as TextChannel;

        const SuccessEmbed = new EmbedBuilder().setColor(color.discord.green);
        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        // await interaction.deferReply();

        const setupData = await setupDB.findOne({
            guildId: guild?.id
        });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${icon.info.error} ***No ticket system was found for the server***`)
                ]
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

        if (!member.roles.cache.hasAny(...setupData.roles) && member.id !== ticketData.ownerId)
            return interaction.reply({
                embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Do not have enough permissions***`)],
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
                    embeds: [SuccessEmbed.setDescription(`${icon.info.success} ***Ticket has been closed!***`)]
                });

                ticketData.closed = true;
                await ticketData.save();

                const owner = b.guild?.members.cache.get(ticketData.ownerId)!;
                const transcriptChannel = b.guild?.channels.cache.get(setupData.transcript)! as TextChannel;

                const transcript =
                    '<!DOCTYPE html>' +
                    (await createTranscript(channel, {
                        limit: -1,
                        returnType: ExportReturnType.String,
                        saveImages: true,
                        favicon: 'guild',
                        poweredBy: false
                    }));

                const formatted = prettier.format(addPrettierIgnore(transcript), { parser: 'html' });

                const buffer = Buffer.from(formatted, 'utf-8');

                const attachement = new AttachmentBuilder(buffer, {
                    name: `transcript-${ticketData.ticketId}-${owner.id}.html`
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

                collector.stop();
            } else {
                collector.stop();
            }
        });

        collector.on('end', () => {
            return interaction.deleteReply();
        });
    }
};

export default button;

function addPrettierIgnore(html: string): string {
    const bodyTagRegex = /<body[^>]*>/i;
    const match = bodyTagRegex.exec(html);
    if (match) {
        const bodyTagIndex = match.index;
        // Insert the prettier-ignore comment just before the <body> tag
        const modifiedHtml = html.slice(0, bodyTagIndex) + '<!-- prettier-ignore -->' + html.slice(bodyTagIndex);
        return modifiedHtml;
    } else {
        // If <body> tag is not found, return the original HTML
        return html;
    }
}
