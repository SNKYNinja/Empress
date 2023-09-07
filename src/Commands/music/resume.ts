import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { ComponentEditor } from '../../Structures/Classes/componentEditor.js';

import { icon } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the current playing track')
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player: any = client.poru.players.get(interaction.guild!.id)!;

        if (!player.isPaused)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***The track is not paused!***`)
                ],
                ephemeral: true
            });

        player.pause(false);

        const editor = new ComponentEditor(player.message);

        const rows = await editor.setButtonData(0, 2, {
            disabled: false,
            emoji: icon.music.pause,
            style: ButtonStyle.Secondary
        });

        player.message?.edit({ components: rows });

        interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blue')
                        .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setDescription(`*Track resumed ― </pause:1032316124655792182> to pause*`)
                ]
            })
            .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};

export default command;
