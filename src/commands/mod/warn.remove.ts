import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder, userMention } from 'discord.js';
import { SubCommand } from 'typings';

import warnSchema from '../../schemas/moderation/warn.db.js';

const command: SubCommand = {
    subCommand: 'warn.remove',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const warnId = interaction.options.getString('warn_id');

        const warnData = await warnSchema.findById(warnId);

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        if (!warnData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(
                        `${client.config.emojis.redCross} ***No warning with ID: ${warnId} was found!***`
                    )
                ]
            });

        warnData.deleteOne({ _id: warnId });

        const Embed = new EmbedBuilder()
            .setColor('#43B383')
            .setDescription(`${client.config.emojis.greenTick} ***Removed warn for ${userMention(warnData.userID)}***`);

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
