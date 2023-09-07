import { DiscordClient } from 'bot.js';
import { CommandInterface, EventInterface } from 'Typings';
import { Events, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { icon } from '../../Structures/Design/design.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ChatInputCommandInteraction | AutocompleteInteraction, client: DiscordClient) => {
        const command = client.commands.get(interaction.commandName);
        const subcommand = interaction.options?.getSubcommand(false);

        const errEmbed = new EmbedBuilder().setColor('Red');
        const redCross = icon.info.redCross;

        if (interaction.isChatInputCommand()) {
            if (!command) {
                return interaction.reply({
                    embeds: [errEmbed.setDescription(`${redCross} ***That command is outdated!***`)],
                    ephemeral: true
                });
            }

            const member = interaction.guild?.members.cache.get(interaction.user.id)!;

            const player = client.poru.players.get(interaction.guild!.id);
            const memberVc = member.voice.channelId;
            const botVc = interaction.guild?.members.me?.voice.channelId;

            if (command.inVc && !memberVc) {
                return interaction.reply({
                    embeds: [
                        errEmbed.setDescription(`${redCross} ***You must be in a voice channel to use this command!***`)
                    ],
                    ephemeral: true
                });
            }

            if (command.sameVc && player && botVc !== memberVc) {
                return interaction.reply({
                    embeds: [
                        errEmbed.setDescription(
                            `${redCross} ***You must be in the same voice channel as mine to use this command!***`
                        )
                    ],
                    ephemeral: true
                });
            }

            if (command.currentTrack && !player?.currentTrack) {
                return interaction.reply({
                    embeds: [errEmbed.setDescription(`${redCross} ***No track is currently being played!***`)],
                    ephemeral: true
                });
            }

            if (command.ownerOnly && interaction.user.id !== client.config.owner)
                return interaction.reply({
                    embeds: [errEmbed.setDescription(`${redCross} ***Not authorized to use this command***`)],
                    ephemeral: true
                });

            try {
                if (subcommand) {
                    const subCommandFile = client.subcommands.get(`${interaction.commandName}.${subcommand}`);
                    subCommandFile?.execute(interaction, client);
                } else {
                    command.execute(interaction, client);
                }
            } catch (error) {
                return interaction.reply({
                    embeds: [errEmbed.setDescription(`${redCross} ***The subcommand is outdated!***`)],
                    ephemeral: true
                });
            }
        } else if (interaction.isAutocomplete()) {
            if (!command) return;

            if (subcommand) {
                const subCommandFile = client.subcommands.get(`${interaction.commandName}.${subcommand}`);

                if (subCommandFile?.autocomplete) {
                    subCommandFile.autocomplete(interaction, client);
                }
            }

            if (command.autocomplete) {
                await command.autocomplete(interaction, client);
            }
        }
    }
};

export default event;
