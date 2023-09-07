import { DiscordClient } from 'bot.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ButtonInterface } from 'Typings';

import { execSync } from 'child_process';

import ConsoleLogger from '../../../Structures/Classes/logger.js';
const logger = new ConsoleLogger();

import { icon, color } from '../../../Structures/Design/design.js';
import { ClientEventHandler } from '../../../Structures/Handlers/clientEvent.js';

const button: ButtonInterface = {
    id: 'reloadEvents',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const now = Date.now();
        await interaction.deferReply({ ephemeral: true });

        try {
            execSync('npm run build', { encoding: 'utf-8' });
            await new ClientEventHandler().loadEvents(client);

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color.discord.background)
                        .setDescription(`${icon.info.success} ***Reloaded Events***`)
                ]
            });
            logger.info(`Discord Events • ${(Date.now() - now) / 1000} sec`);
        } catch (err) {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color.discord.background)
                        .setDescription(`${icon.info.error} Handler **failed to load:** \`\`\`${err}\`\`\``)
                ]
            });
            logger.error(`Handler Failed to Restart • ${err}`);
        }
    }
};

export default button;
