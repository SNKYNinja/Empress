import { DiscordClient } from '../../bot.js';
import { ButtonInterface, CommandInterface, EventInterface } from '../../typings/index';
import { Events, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        if (!interaction.isButton()) return;
        const button: ButtonInterface | undefined = client.buttons.get(interaction.customId);

        if (button) {
            button.execute(interaction, client);
        }
    }
};

export default event;
