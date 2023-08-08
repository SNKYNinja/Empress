import { DiscordClient } from 'bot.js';
import { ChatInputCommandInteraction, EmbedBuilder, userMention } from 'discord.js';
import { SubCommand } from 'Typings';

import warnSchema from '../../Schemas/moderation/warn.db.js';
import { icon, color } from '../../Structure/Design/design.js';

const command: SubCommand = {
    subCommand: 'warn.remove',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const warnId = interaction.options.getString('warn_id');

        const warnData = await warnSchema.findById(warnId);

        const ErrorEmbed = new EmbedBuilder().setColor('Red');

        if (!warnData)
            return interaction.reply({
                embeds: [
                    ErrorEmbed.setDescription(`${icon.info.redCross} ***No warning with ID: ${warnId} was found!***`)
                ]
            });

        warnData.deleteOne({ _id: warnId });

        const Embed = new EmbedBuilder()
            .setColor(color.discord.green)
            .setDescription(`${icon.info.greenTick} ***Removed warn for ${userMention(warnData.userID)}***`);

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
