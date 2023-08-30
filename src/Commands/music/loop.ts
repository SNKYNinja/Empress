import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import { Player } from 'poru';

import { ComponentEditor } from '../../Structures/Classes/componentEditor.js';

import { icon } from '../../Structures/Design/design.js';
import { trimSentence } from '../../Functions/trimSentence.js';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set the loop mode of the player')
        .addStringOption((option) =>
            option
                .setName('mode')
                .setDescription('Choose the looping mode')
                .addChoices(
                    { name: 'Track', value: 'TRACK' },
                    { name: 'Queue', value: 'QUEUE' },
                    { name: 'Disable', value: 'NONE' }
                )
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player: Player | any = client.poru.players.get(interaction.guild!.id)!;
        const loop = interaction.options.getString('mode')!;

        if (loop === 'QUEUE' && player.queue.length === 0)
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`${icon.info.error} ***No tracks in the queue to loop!***`)
                ],
                ephemeral: true
            });

        let description: string;

        if (loop === 'TRACK')
            description = `***Track looped** ― [${trimSentence(player.currentTrack.info.title, 31)}](${
                player.currentTrack.info.uri
            })*`;
        else if (loop === 'QUEUE')
            description = `***Queue looped** ― **${player.queue.length + 1}** track${
                player.queue.length === 1 ? '' : 's'
            }*`;
        else description = `***Loop disabled** ― **${capitalizeFirstLetter(player.loop)}***`;

        const data = switchLoop(player);

        const editor = new ComponentEditor(player.message);
        const rows = await editor.setButtonData(0, 0, {
            emoji: data.emoji,
            disabled: false
        });

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(description);

        await player.message?.edit({ components: rows });

        interaction.reply({ embeds: [Embed] }).then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};

export default command;

function capitalizeFirstLetter(str: string) {
    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
}

function switchLoop(player: Player) {
    let description: string;
    let emoji: string;

    const queueLoop = `*Queue Looped ― **${player.queue.length + 1}** track${player.queue.length === 1 ? '' : 's'}*`;
    const trackLoop = `*Track Looped ― [${player.currentTrack.info.title}](${player.currentTrack.info.uri})*`;
    const disabledLoop = '*Loop Disabled ― Player*';

    if (player?.loop === 'TRACK') {
        if (player.queue.length > 0) {
            player.setLoop('QUEUE');
            description = queueLoop;
            emoji = '<:loop_queue:1072180901364113539>';
        } else {
            player.setLoop('NONE');
            description = disabledLoop;
            emoji = '<:loop_button:1039487431709311026>';
        }
    } else if (player?.loop === 'QUEUE') {
        player.setLoop('NONE');
        description = disabledLoop;
        emoji = '<:loop_button:1039487431709311026>';
    } else {
        player?.setLoop('TRACK');
        description = trackLoop;
        emoji = '<:loop_once:1072180421598650448>';
    }

    return { description, emoji };
}
