import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { SubCommand } from 'Typings';
import { Types } from 'mongoose';

import warnSchema from '../../Schemas/moderation/warn.db.js';
import { icon, color } from '../../Structures/Design/design.js';

const command: SubCommand = {
    subCommand: 'warn.add',
    execute: async (interaction: ChatInputCommandInteraction) => {
        const warnUser = interaction.options.getUser('user')!;
        const reason = interaction.options.getString('reason') || 'No Reason';

        const guild = interaction.guild!;
        const user = interaction.user!;

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        if (warnUser.id === user.id)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${icon.info.redCross} ***Warning infraction cannot be added to yourself***`
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
                            .setDescription(`${icon.info.greenTick} ***${warnUser} has been warned!***`)
                            .setColor(color.discord.green)
                    ]
                });
            })
            .catch((err) => {
                console.log(err);
                interaction.reply({
                    embeds: [ErrorEmbed.setDescription(`${icon.info.redCross} ***Error processing the request!***`)]
                });
            });
    }
};

export default command;
