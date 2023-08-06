import { DiscordClient } from 'bot.js';
import { ButtonInterface, EventInterface } from 'Typings';
import { Events, ButtonInteraction } from 'discord.js';

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
