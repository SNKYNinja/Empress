import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SubCommand } from 'typings';
import { Types } from 'mongoose';

import warnSchema from '../../schemas/moderation/warn.db.js';

const command: SubCommand = {
    subCommand: 'warn.add',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const warnUser = interaction.options.getUser('user')!;
        const reason = interaction.options.getString('reason') || 'No Reason';

        const guild = interaction.guild!;
        const user = interaction.user!;

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        if (warnUser.id === user.id)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.redCross} ***Warning infraction cannot be added to yourself***`
                    )
                ]
            });

        warnSchema
            .create({
                _id: new Types.ObjectId(),
                guildID: guild.id,
                userID: warnUser.id,
                moderator: user.id,
                reason: reason
            })
            .then(() => {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.config.emojis.greenTick} ***${warnUser} has been warned!***`)
                            .setColor('#43B383')
                    ]
                });
            })
            .catch((err) => {
                console.log(err);
                interaction.reply({
                    embeds: [
                        ErrorEmbed.setDescription(
                            `${client.config.emojis.redCross} ***Error processing the request!***`
                        )
                    ]
                });
            });
    }
};

export default command;
