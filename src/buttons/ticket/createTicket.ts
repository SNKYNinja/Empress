import { DiscordClient } from 'bot';
import {
    ButtonInteraction,
    EmbedBuilder,
    Guild,
    Role,
    User,
    userMention,
    roleMention,
    ChannelType,
    PermissionFlagsBits,
    TextChannel,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { ButtonInterface } from 'typings';

import setupDB from '../../schemas/ticket/setup.db.js';
import ticketsDB from '../../schemas/ticket/tickets.db.js';

const button: ButtonInterface = {
    id: 'createTicket',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const guild = interaction.guild as Guild;
        const user = interaction.user as User;

        await interaction.deferReply({ ephemeral: true });

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        const setupData = await setupDB.findOne({
            guildId: guild.id
        });

        if (!setupData)
            return interaction.editReply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.error} ***No ticket system was found for the server***`
                    )
                ]
            });

        const existingTicket = await ticketsDB.findOne({
            guildId: guild?.id,
            ownerId: user.id,
            closed: false
        });

        if (existingTicket)
            return interaction.editReply({
                embeds: [
                    ErrorEmbed.setDescription(`${client.config.emojis.error} ***You already have a ticket opened!***`)
                ]
            });

        let roles: Role[] = [];
        for (let roleId of setupData.roles) {
            const role = guild?.roles.cache.get(roleId);
            role && roles.push(role);
        }

        const rolePerms: Array<{ id: string; allow: bigint[] }> = roles.map((role) => {
            return {
                id: role.id,
                allow: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            };
        });

        const rolesToMention = [userMention(user.id), ...roles.map((role) => roleMention(role.id))];

        const ticketId = (await ticketsDB.countDocuments({ guildId: guild.id })) + 1;

        await guild.channels
            .create({
                name: `〢ticket-${ticketId}`,
                topic: `**User**: ${userMention(user.id)}\n **Ticket ID**:${ticketId}`,
                parent: setupData.category,
                type: ChannelType.GuildText,
                rateLimitPerUser: 2,
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: client.user?.id!,
                        allow: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    ...rolePerms
                ]
            })
            .then(async (channel: TextChannel) => {
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#43B383')
                            .setDescription(
                                `${client.config.emojis.success} ***Your ticket has been created: ${channel}***`
                            )
                    ]
                });

                await ticketsDB.create({
                    guildId: guild.id,
                    channelId: channel.id,
                    ownerId: user.id,
                    ticketId: ticketId,
                    membersId: [user.id],
                    createdAt: Math.floor(Date.now() / 1000)
                });

                const resEmbed = new EmbedBuilder()
                    .setColor('#2F3136')
                    .setAuthor({ name: `${guild.name} | Ticket System`, iconURL: guild.iconURL()! })
                    .setTitle(`Ticket ID: ${ticketId}`)
                    .setDescription(
                        `
                    <:icon_forward:1022894698911776838> ***Requirements:***
                    \`\`•\`\` *Provide as much details as you can about your query!*
                    
                    <:icon_forward:1022894698911776838> ***Admin Actions:***
                    \`\`•\`\` **Close Ticket:** *Close the ticket with the reason*
                    \`\`•\`\` **Claim Ticket:** *Claim the ticket as a staff member*
                    \`\`•\`\` **Lock Ticket:** *Lock the ticket for the ticket user(s)*
                    \`\`•\`\` **Unlock Ticket:** *Unlock the ticket for the ticket user(s)*
                    `
                    );

                const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('closeTicket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('claimTicket')
                        .setLabel('Claim Ticket')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('lockTicket').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('unlockTicket')
                        .setEmoji('🔓')
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Secondary)
                );

                channel.send({
                    content: `${client.config.emojis.announce} ${rolesToMention.join(' • ')}`,
                    embeds: [resEmbed],
                    components: [buttonsRow]
                });
            });
    }
};

export default button;
