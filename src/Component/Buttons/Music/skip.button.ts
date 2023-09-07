import { ButtonInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';

const button: ButtonInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    id: 'skip',
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        interaction.deferUpdate();

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue')
            .setTimestamp()
            .setDescription(`*Skipped ― [${player.currentTrack.info.title}](${player.currentTrack.info.uri})*`);

        const message = await interaction.channel!.send({ embeds: [embed] });
        setTimeout(() => message?.delete(), 7000);
        player.stop();
    }
};

export default button;
