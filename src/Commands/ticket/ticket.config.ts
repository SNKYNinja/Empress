import { SubCommand } from 'Typings';
import { DiscordClient } from 'bot.js';
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuBuilder,
    channelMention,
    roleMention
} from 'discord.js';

import setupDB from '../../Schemas/ticket/setup.db.js';
import { icon } from '../../Structures/Design/design.js';

const command: SubCommand = {
    subCommand: 'ticket.config',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const { guild, user } = interaction;

        const setupData = await setupDB.findOne({ guildId: guild?.id });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${icon.info.error} ***No ticket setup found! Use </ticket setup:1127950081685995590>***`
                        )
                ]
            });

        const ticketChannel = channelMention(setupData.channel);
        const transcriptChannel = channelMention(setupData.transcript);
        const ticketCategory = channelMention(setupData.category);
        const isActive = setupData.active;

        const roles = setupData.roles
            .map((roleId) => {
                const role = guild?.roles.cache.get(roleId);
                return role ? roleMention(role.id) : '(Not Found)';
            })
            .join(' ');

        const responseEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `${client.user?.username} | Ticket System`,
                iconURL: client.user?.displayAvatarURL()
            })
            .setDescription(
                `Ticket system for having a ticket based query helper which helps admin to smooth out questions and concerns of users.\n`
            )
            .addFields([
                { name: 'Ticket Status', value: `${icon.reply.default} ${switchTo(isActive)}` },
                { name: 'Ticket Channel', value: `${icon.reply.default} ${ticketChannel}` },
                { name: 'Transcript Channel', value: `${icon.reply.default} ${transcriptChannel}` },
                { name: 'Ticket Category', value: `${icon.reply.default} ${ticketCategory}` },
                {
                    name: `Ticket Staff Roles (${setupData?.roles.length}/3)`,
                    value: `${icon.reply.default} ${roles}`
                }
            ]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticketConfig')
                .setOptions([
                    { label: 'Enable/Disable Ticket System', value: 'isActive' },
                    { label: 'Change Ticket Channel', value: 'ticketChannel' },
                    { label: 'Change Transcript Channel', value: 'transcriptChannel' },
                    { label: "Change Ticket's Category", value: 'ticketCategory' },
                    { label: 'Add Ticket Staff Roles', value: 'addTicketRoles' },
                    { label: 'Remove Ticket Staff Roles', value: 'removeTicketRoles' }
                ])
                .setPlaceholder('Change settings from here')
        );

        await interaction.reply({
            embeds: [responseEmbed],
            components: [row]
        });
    }
};

function switchTo(isActive: boolean) {
    return isActive
        ? '<:icon_status_online:1019980303911108741> Enabled'
        : '<:icon_status_offline:1019992595021185104> Disabled';
}

export default command;
