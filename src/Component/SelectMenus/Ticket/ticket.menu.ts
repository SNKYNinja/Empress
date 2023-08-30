import { SelectMenuInterface } from 'Typings';
import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ChannelType,
    EmbedBuilder,
    MessageCollectorOptions,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    channelMention,
    roleMention
} from 'discord.js';

import { color, icon } from '../../../Structures/Design/design.js';

import setupDb from '../../../Schemas/ticket/setup.db.js';

const ErrorEmbed = new EmbedBuilder().setColor('Red');

const menu: SelectMenuInterface = {
    id: 'ticketConfig',
    execute: async (interaction: StringSelectMenuInteraction, client: DiscordClient) => {
        const setupData = await setupDb.findOne({ guildId: interaction.guild?.id });

        if (!setupData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${icon.info.error} ***No ticket setup found! Use </ticket setup:1127950081685995590>***`
                    )
                ]
            });

        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        if (
            !member.roles.cache.hasAny(...setupData.roles) &&
            !member.permissions.has(PermissionFlagsBits.Administrator)
        )
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${icon.info.error} ***You don't have permission to use this menu!***`)
                ],
                ephemeral: true
            });

        const Embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const component = ActionRowBuilder.from(interaction.message.components[0]);

        interface CollectorOptions {
            channelOption: MessageCollectorOptions;
            categoryOption: MessageCollectorOptions;
            roleOption: MessageCollectorOptions;
        }

        const options: CollectorOptions = {
            channelOption: {
                time: 60 * 1000,
                filter: (m) => {
                    return (
                        m.author.id === interaction.user.id &&
                        (m.mentions.channels.size === 1 || /^\d{19}$/.test(m.content.trim()))
                    );
                }
            },
            categoryOption: {
                time: 60 * 1000,
                filter: (m) => {
                    return m.author.id === interaction.user.id && /^\d{19}$/.test(m.content.trim());
                }
            },
            roleOption: {
                time: 60 * 1000,
                filter: (m) => {
                    return (
                        m.author.id === interaction.user.id &&
                        (m.mentions.roles.size === 1 || /^\d{19}$/.test(m.content.trim()))
                    );
                }
            }
        };

        switch (interaction.values[0]) {
            case 'isActive': {
                setupData.active = !setupData.active;

                if (Embed.data.fields)
                    Embed.data.fields[0].value = `${icon.reply.default} ${switchTo(setupData.active)}`;

                await setupData.save();
                interaction.update({ embeds: [Embed] });

                break;
            }

            case 'ticketChannel': {
                const collector = interaction.channel?.createMessageCollector(options.channelOption);

                interaction.message.edit({ components: [] });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color.discord.green)
                            .setDescription(
                                '***<a:icon_google:1027550043164655637> Mention the channel or the channel id***'
                            )
                    ]
                });

                collector?.on('collect', async (m) => {
                    let channelId = m.content.trim();
                    if (m.mentions.channels.size === 1) channelId = m.mentions.channels.first()?.id!;

                    const channel = interaction.guild?.channels.cache.get(channelId);

                    m.deletable && m.delete();
                    interaction.deleteReply().catch(() => {});

                    if (!channel) return collector.stop('noChannelFound');
                    if (channel.type !== ChannelType.GuildText) return collector.stop('noTextChannel');

                    setupData.channel = channelId;

                    if (Embed.data.fields)
                        Embed.data.fields[1].value = `${icon.reply.default} ${channelMention(channelId)}`;

                    await setupData.save();

                    collector.stop('success');
                });

                collector?.on('end', (collected, reason) => {
                    collectorEnd(interaction, Embed, component, reason);
                });

                break;
            }

            case 'transcriptChannel': {
                const collector = interaction.channel?.createMessageCollector(options.channelOption);

                interaction.message.edit({ components: [] });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color.discord.green)
                            .setDescription(
                                '***<a:icon_google:1027550043164655637> Mention the channel or the channel id***'
                            )
                    ]
                });

                collector?.on('collect', async (m) => {
                    let channelId = m.content.trim();
                    if (m.mentions.channels.size === 1) channelId = m.mentions.channels.first()?.id!;

                    const channel = interaction.guild?.channels.cache.get(channelId);

                    m.deletable && m.delete();
                    interaction.deleteReply().catch(() => {});

                    if (!channel) return collector.stop('noChannelFound');
                    if (channel.type !== ChannelType.GuildText) return collector.stop('noTextChannel');

                    setupData.transcript = channelId;

                    if (Embed.data.fields)
                        Embed.data.fields[2].value = `${icon.reply.default} ${channelMention(channelId)}`;

                    await setupData.save();

                    collector.stop('success');
                });

                collector?.on('end', (collected, reason) => {
                    collectorEnd(interaction, Embed, component, reason);
                });

                break;
            }

            case 'ticketCategory': {
                const collector = interaction.channel?.createMessageCollector(options.categoryOption);

                interaction.message.edit({ components: [] });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color.discord.green)
                            .setDescription(
                                '***<a:icon_google:1027550043164655637> Provide the category id to select***'
                            )
                    ]
                });

                collector?.on('collect', async (m) => {
                    let channelId = m.content.trim();

                    const channel = interaction.guild?.channels.cache.get(channelId);

                    m.deletable && m.delete();
                    interaction.deleteReply().catch(() => {});

                    if (!channel) return collector.stop('noChannelFound');
                    if (channel.type !== ChannelType.GuildCategory) return collector.stop('noCategoryChannel');

                    setupData.transcript = channelId;

                    if (Embed.data.fields)
                        Embed.data.fields[3].value = `${icon.reply.default} ${channelMention(channelId)}`;

                    await setupData.save();

                    collector.stop('success');
                });

                collector?.on('end', (collected, reason) => {
                    collectorEnd(interaction, Embed, component, reason);
                });

                break;
            }

            case 'addTicketRoles': {
                if (setupData.roles.length === 3)
                    return interaction.reply({
                        embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***You can only add 3 roles***`)],
                        ephemeral: true
                    });

                const collector = interaction.channel?.createMessageCollector(options.roleOption);

                interaction.message.edit({ components: [] });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color.discord.green)
                            .setDescription('***<a:icon_google:1027550043164655637> Mention the role or the role id***')
                    ]
                });

                collector?.on('collect', async (m) => {
                    let roleId = m.content.trim();
                    if (m.mentions.roles.size === 1) roleId = m.mentions.roles.first()?.id!;

                    const role = interaction.guild?.roles.cache.get(roleId);

                    m.deletable && m.delete();
                    interaction.deleteReply().catch(() => {});

                    if (!role) return collector.stop('noRoleFound');
                    if (setupData.roles.includes(roleId)) return collector.stop('alreadyAdded');

                    setupData.roles.push(roleId);

                    const roleString = setupData.roles
                        .map((roleId) => {
                            const role = m.guild?.roles.cache.get(roleId);
                            return role ? roleMention(role.id) : '(Not Found)';
                        })
                        .join(' ');

                    if (Embed.data.fields) {
                        Embed.data.fields[4].name = `Ticket Staff Roles (${setupData.roles.length}/3)`;
                        Embed.data.fields[4].value = `${icon.reply.default} ${roleString}`;
                    }

                    await setupData.save();

                    collector.stop('success');
                });

                collector?.on('end', (collected, reason) => {
                    collectorEnd(interaction, Embed, component, reason);
                });

                break;
            }

            case 'removeTicketRoles': {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('col-removeTicketRoles')
                    .setPlaceholder('Select the roles to remove')
                    .setMinValues(1)
                    .setMaxValues(2);

                setupData.roles.map((roleId) => {
                    const role = interaction.guild?.roles.cache.get(roleId);
                    if (role) selectMenu.addOptions({ label: role.name, value: role.id, description: role.id });
                    else selectMenu.addOptions({ label: 'Not Found', value: roleId });
                });

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color.discord.green)
                            .setDescription(
                                '***<a:icon_google:1027550043164655637> Select the roles you want to remove from staff roles***'
                            )
                    ],
                    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)]
                });

                const collector = msg.createMessageComponentCollector({
                    time: 60 * 1000,
                    filter: (m) => m.user.id === interaction.user.id
                });

                interaction.message.edit({ components: [] });

                console.log('Before Collector');

                collector.on('collect', async (m) => {
                    console.log('After Collector');
                    await m.deferUpdate();

                    console.log('isStringSelectMenu', m.isStringSelectMenu());

                    if (!m.isStringSelectMenu()) return collector.stop();

                    console.log(m.values);

                    m.values.forEach((roleId) => {
                        const index = setupData.roles.indexOf(roleId);
                        if (index > -1) setupData.roles.splice(index, 1);
                    });

                    m.message.deletable && m.message.delete();

                    await setupData.save();

                    collector.stop();
                });

                collector.on('end', () => {
                    interaction.message.edit({
                        embeds: [Embed],
                        components: [component as ActionRowBuilder<StringSelectMenuBuilder>]
                    });

                    interaction.deleteReply().catch(() => {});
                });

                break;
            }
        }
    }
};

function switchTo(isActive: boolean) {
    return isActive
        ? '<:icon_status_online:1019980303911108741> Enabled'
        : '<:icon_status_offline:1019992595021185104> Disabled';
}

function collectorEnd(interaction: StringSelectMenuInteraction, Embed: EmbedBuilder, component: any, reason: string) {
    interaction.message.edit({
        embeds: [Embed],
        components: [component as ActionRowBuilder<StringSelectMenuBuilder>]
    });

    if (reason === 'noChannelFound')
        interaction.followUp({
            embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Channel provided was not found!***`)],
            ephemeral: true
        });
    else if (reason === 'noTextChannel')
        interaction.followUp({
            embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Channel provided is not a text channel!***`)],
            ephemeral: true
        });
    else if (reason === 'noCategoryChannel')
        interaction.followUp({
            embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Channel provided is not a category channel!***`)],
            ephemeral: true
        });
    else if (reason === 'noRoleFound')
        interaction.followUp({
            embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Role provided was not found!***`)],
            ephemeral: true
        });
    // else if (reason === 'noManagedRole')
    //     interaction.followUp({
    //         embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Role provided is not manageable!***`)],
    //         ephemeral: true
    //     });
    else if (reason === 'alreadyAdded')
        interaction.followUp({
            embeds: [ErrorEmbed.setDescription(`${icon.info.error} ***Role provided is already added!***`)],
            ephemeral: true
        });
    else if (reason === 'time') {
        interaction.deleteReply().catch(() => {});
        interaction.followUp;
    }
}

export default menu;
