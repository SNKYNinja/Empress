import { EventInterface, SelectMenuInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { AnySelectMenuInteraction, Events, EmbedBuilder } from 'discord.js';
import { icon } from '../../Structures/Design/design.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: AnySelectMenuInteraction, client: DiscordClient) => {
        if (!interaction.isAnySelectMenu()) return;
        const menu: SelectMenuInterface | undefined = client.selectMenus.get(interaction.customId);

        const errEmbed = new EmbedBuilder().setColor('Red');
        const redCross = icon.info.redCross;

        if (interaction.customId.startsWith('col-')) return;
        if (!menu)
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***That select menu is outdated!***`)],
                ephemeral: true
            });

        menu.execute(interaction, client);
    }
};

export default event;
