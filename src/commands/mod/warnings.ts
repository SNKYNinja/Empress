import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, userMention } from 'discord.js';
import { CommandInterface } from 'Typings';

import DB from '../../Schemas/moderation/warn.db.js';
import { DiscordClient } from '../../bot.js';
import EmbedPaginator from '../../Structure/Classes/pages.js';
import { icon } from '../../Structure/Design/design.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Show warnings of a user')
        .addUserOption((option) => option.setName('user').setDescription('Select user to display warns')),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const user = interaction.options.getUser('user') || interaction.user;

        const userWarns = await DB.find({
            guildID: interaction.guild?.id,
            userID: user.id
        });

        if (userWarns.length === 0)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${icon.info.redCross} ***${userMention(user.id)} has no warnings to display!***`
                        )
                ]
            });

        const chunkSize = 5;
        let arrEmbeds: EmbedBuilder[] = [];

        for (let i = 0; i < userWarns.length; i += chunkSize) {
            const logEmbed = new EmbedBuilder()
                .setColor('#2F3136')
                .setAuthor({ name: `${user.username} | ${user.id}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.avatarURL());

            const chunk = userWarns.slice(i, i + chunkSize);
            chunk.forEach((warning) =>
                logEmbed.addFields({
                    name: `__Case ID:__ \`${warning._id}\``,
                    value: `
                        • **Reason:** ${warning.reason}
                        • **Moderator:** <@${warning.moderator}>
                        • **Date:** <t:${Math.floor(warning.createdAt.getTime() / 1000)}:F>`
                })
            );

            arrEmbeds.push(logEmbed);
        }

        const paginator = new EmbedPaginator(client, interaction, arrEmbeds);
        await paginator.loadPages();
    }
};

export default command;
