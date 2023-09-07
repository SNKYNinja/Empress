import { DiscordClient } from 'bot.js';
import { ButtonInterface, EventInterface } from 'Typings';
import { Events, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { icon } from '../../Structures/Design/design.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        if (!interaction.isButton()) return;
        const button: ButtonInterface | undefined = client.buttons.get(interaction.customId);

        const errEmbed = new EmbedBuilder().setColor('Red');
        const redCross = icon.info.redCross;

        if (!button)
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***That button is outdated!***`)],
                ephemeral: true
            });

        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        const player = client.poru.players.get(interaction.guild!.id);
        const memberVc = member.voice.channelId;
        const botVc = interaction.guild?.members.me?.voice.channelId;

        if (button.inVc && !memberVc) {
            return interaction.reply({
                embeds: [
                    errEmbed.setDescription(`${redCross} ***You must be in a voice channel to use this command!***`)
                ]
            });
        }

        if (button.sameVc && player && botVc !== memberVc) {
            return interaction.reply({
                embeds: [
                    errEmbed.setDescription(
                        `${redCross} ***You must be in the same voice channel as mine to use this command!***`
                    )
                ]
            });
        }

        if (button.currentTrack && !player?.currentTrack) {
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***No track is currently being played!***`)]
            });
        }

        button.execute(interaction, client);
    }
};

export default event;
