import { SubCommand } from 'Typings';
import { DiscordClient } from 'bot';
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';

const command: SubCommand = {
    subCommand: 'playlist.create',
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const modal = new ModalBuilder();

        const nameInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('playlistName')
                .setLabel('Playlist Name')
                .setMinLength(5)
                .setStyle(TextInputStyle.Short)
        );

        const urlInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('playlistURL')
                .setLabel('Playlist/Track URL')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Youtube/Spotify')
        );

        modal.addComponents(nameInput, urlInput);
        await interaction.showModal(modal);

        const modalInteraction = await interaction.awaitModalSubmit({
            time: 60 * 1000,
            filter: (m) => m.user.id === interaction.user.id
        });

        const name = modalInteraction.fields.getTextInputValue('playlistName');
        const url = modalInteraction.fields.getTextInputValue('playlistURL');

        const resolve = await client.poru.resolve({ query: url });

        const { loadType, playlistInfo, tracks } = resolve;

        const track = tracks.shift();
    }
};

export default command;
