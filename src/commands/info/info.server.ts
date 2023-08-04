import getGuildData from '../../Functions/guildData.js';
import { splitPascal, toPascalCase, getChannelTypeSize, maxDisplayRoles } from '../../Functions/utility.js';
import { DiscordClient } from '../../bot.js';
import { SubCommand } from '../../Typings/index';
import { ChatInputCommandInteraction, Guild, ChannelType, EmbedBuilder } from 'discord.js';
import { icon } from '../../Structure/Design/design.js';

const command: SubCommand = {
    subCommand: 'info.server',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();

        const guild = interaction.guild as Guild;
        const { members, channels, emojis, roles, stickers } = guild;

        const sortedRoles = roles.cache
            .map((role) => role)
            .slice(1, roles.cache.size)
            .sort((a, b) => b.position - a.position);
        const userRoles = sortedRoles.filter((role) => !role.managed);
        const managedRoles = sortedRoles.filter((role) => role.managed);
        const botCount = members.cache.filter((member) => member.user.bot).size;

        const guildMetaData = getGuildData(guild);

        const totalChannels = getChannelTypeSize(channels, [
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.GuildCategory,
            ChannelType.GuildAnnouncement,
            ChannelType.AnnouncementThread,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.GuildStageVoice,
            ChannelType.GuildDirectory,
            ChannelType.GuildForum
        ]);

        type HexColor = `#${string}`;

        let embedColor: HexColor;
        if (members.me?.roles.highest.hexColor === '#000000') embedColor = '#2F3136';
        else embedColor = members.me?.roles.highest.hexColor as HexColor;

        const guildCreatedTimestamp = Math.floor(guild.createdTimestamp / 10000);

        const responseEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${guild.name}'s Information`)
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .setImage(guild.bannerURL({ size: 1024 }))
            .addFields(
                {
                    name: `${icon.reply.default} __About__`,
                    value: `
                    **Name:** ${guild.name}
                    **ID:** ${guild.id},
                    **Owner <:icon_crown:1048304963178217472>:** <@${guild.ownerId}>
                    **Created:** <t:${guildCreatedTimestamp}:R>
                    **Language:** ${new Intl.DisplayNames(['en'], { type: 'language' }).of(guild.preferredLocale)}
                    **Vanity URL:** ${guild.vanityURLCode || 'None'}
                    **Upload Limit:** ${guildMetaData.uploadLimit} MB
                    `
                },
                {
                    name: `${icon.reply.default} __Security__`,
                    value: `
                    **Explicit Filter:** ${splitPascal(guildMetaData.explicitContentFilter, ' ')}
                    **NSFW Level:** ${splitPascal(guildMetaData.nsfwLevel, ' ')}
                    **Verification Level:** ${splitPascal(guildMetaData.verificationLevel, ' ')}
                    `
                },
                {
                    name: `${icon.reply.default} __Users__ (${guild.memberCount})`,
                    value: `
                    **Members:** ${guild.memberCount - botCount}
                    **Bots:** ${botCount}
                    **Banned:** ${guild.bans.cache.size}
                    `,
                    inline: true
                },
                {
                    name: `${icon.reply.default} __Features__`,
                    value:
                        guild.features
                            .map((feature: any) => `${icon.info.greenTick} - ${toPascalCase(feature, ' ')}`)
                            .join('\n') || 'None'
                },
                {
                    name: `<:reply:1001495577093230753> __User Roles__ (${maxDisplayRoles(userRoles)} of ${
                        userRoles.length
                    })`,
                    value: `${userRoles.slice(0, maxDisplayRoles(userRoles)).join(' ') || 'None'}`
                },
                {
                    name: `<:reply:1001495577093230753> __Managed Roles__ (${maxDisplayRoles(managedRoles)} of ${
                        managedRoles.length
                    })`,
                    value: `${managedRoles.slice(0, maxDisplayRoles(managedRoles)).join(' ') || 'None'}`
                },
                {
                    name: `<:reply:1001495577093230753> __Total Channels__ (${totalChannels})`,
                    value: `
                    **Text:** ${getChannelTypeSize(channels, [
                        ChannelType.GuildText,
                        ChannelType.GuildForum,
                        ChannelType.GuildAnnouncement
                    ])}
                    **Voice <:icon_channel_voice:1005160005344968826> :** ${getChannelTypeSize(channels, [
                        ChannelType.GuildVoice,
                        ChannelType.GuildStageVoice
                    ])}
                    **Threads <:icon_thread:1005160003000336474> :** ${getChannelTypeSize(channels, [
                        ChannelType.PublicThread,
                        ChannelType.PrivateThread,
                        ChannelType.AnnouncementThread
                    ])}
                    **Categories <:icon_category:1006574005895053383> :** ${getChannelTypeSize(channels, [
                        ChannelType.GuildCategory
                    ])}
                    **Forums <:icon_forum:1048463081707159553> :** ${getChannelTypeSize(channels, [
                        ChannelType.GuildForum
                    ])}
                    `,
                    inline: true
                },
                {
                    name: `<:reply:1001495577093230753> __Emojis & Stickers__ (${
                        emojis.cache.size + stickers.cache.size
                    })`,
                    value: [
                        `**Animated:** ${emojis.cache.filter((emoji) => emoji.animated).size}/${
                            guildMetaData.maxAnimatedEmojis
                        }`,
                        `**Static:** ${emojis.cache.filter((emoji) => !emoji.animated).size}/${
                            guildMetaData.maxEmojis
                        }`,
                        `**Stickers:** ${stickers.cache.size}/${guildMetaData.maxStickers}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '<:reply:1001495577093230753> __Nitro Status__',
                    value: `
                    **Level:** ${guildMetaData.boostLevel} <:icon_nitro:1005162368927551498>
                    **Boosts:** ${guild.premiumSubscriptionCount}
                    **Booster Role:** ${guild.roles.premiumSubscriberRole || 'None'}
                    `,
                    inline: true
                },
                { name: 'Banner', value: guild.bannerURL() ? '** **' : `${icon.info.redCross} None` }
            );

        interaction.followUp({ embeds: [responseEmbed] });
    }
};

export default command;
