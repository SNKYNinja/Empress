import { DiscordClient } from '../../bot.js';
import { SubCommand } from '../../typings/index';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

const command: SubCommand = {
    subCommand: 'info.user',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const { options, guild } = interaction;
        const user = await options.getUser('target')?.fetch();
        if (!user) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.config.colors.red)
                        .setDescription(`${client.config.emojis.error} oh no! And error occured :(`),
                ],
                ephemeral: true,
            });
        }

        let embed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL())
            .setColor(user.hexAccentColor || client.config.colors.theme)
            .addFields({
                name: 'General',
                value: [
                    `> **User:** ${user.username}`,
                    `> **ID:** ${user.id}`,
                    `> **Mention:** ${user}`,
                    `> **Created:** <t:${Math.round(user.createdTimestamp! / 1000)}:R>`,
                ].join('\n'),
            });

        if (user.bannerURL()) {
            embed.setImage(user.bannerURL({ size: 1024 }) as string);
        }

        const member = await guild?.members.cache.get(user.id)?.fetch();
        if (member) {
            embed.addFields({
                name: `Server`,
                value: [
                    `> **Display Name:** \`${member.displayName}\``,
                    `> **Display Hex Color:** \`${member.displayHexColor}\``,
                    `> **Nickname:** ${member.nickname ? member.nickname : 'None'}`,
                    `> **isManageable:** ${member.manageable}`,
                    `> **isModeratable:** ${member.moderatable}`,
                    `> **isBannable:** ${member.bannable}`,
                    `> **isKickable:** ${member.kickable}`,
                    `> **Joined:** <t:${Math.round(member.joinedTimestamp! / 1000)}:R>`,
                ].join('\n'),
            });
        }

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
export default command;
