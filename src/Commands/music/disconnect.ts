import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect the player from the voice channel')
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Player disconnected ― <#${player.voiceChannel}>`);

        player.destroy();
        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
