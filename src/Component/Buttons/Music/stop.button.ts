import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction } from 'discord.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    id: 'stop',
    execute: (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        player.destroy();

        interaction.deferUpdate();
    }
};

export default button;
