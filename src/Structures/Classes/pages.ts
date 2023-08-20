import { DiscordClient } from 'bot.js';
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder,
    userMention
} from 'discord.js';
import { icon } from '../Design/design.js';

type Interaction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

export default class EmbedPaginator {
    public readonly client: DiscordClient;
    public readonly interaction: Interaction;
    public readonly embeds: EmbedBuilder[];
    public readonly pages: { id?: number };
    public disableTime: number;
    public ephemeral: boolean;
    public deferReplied: boolean;
    constructor(client: DiscordClient, interaction: Interaction, embeds: EmbedBuilder[]) {
        this.client = client;
        this.interaction = interaction;
        this.embeds = embeds;
        this.pages = {};
        this.disableTime = 60 * 5 * 1000; // 5 mins
        this.ephemeral = false;
        this.deferReplied = false;
    }

    private getRow(id: string) {
        //Create the action row with buttons
        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents(
            new ButtonBuilder()
                .setEmoji('<:icon_backward:1022894766742044813>')
                .setCustomId('most_prev_embed')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(this.pages[id] === 0)
        );
        row.addComponents(
            new ButtonBuilder()
                .setEmoji('<:icon_back:1017419600809443450>')
                .setCustomId('prev_embed')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.pages[id] === 0)
        );
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('page-no')
                .setLabel(`${this.pages[id] + 1}/${this.embeds.length}`)
                .setStyle(ButtonStyle.Secondary)
        );

        row.addComponents(
            new ButtonBuilder()
                .setEmoji('<:icon_front:1017419598666137610>')
                .setCustomId('next_embed')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.pages[id] === this.embeds.length - 1)
        );

        row.addComponents(
            new ButtonBuilder()
                .setEmoji('<:icon_forward:1022894698911776838>')
                .setCustomId('most_next_embed')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(this.pages[id] === this.embeds.length - 1)
        );

        return row;
    }

    public async loadPages() {
        const id = this.interaction.id;
        this.pages[id] ??= 0;

        const embed = this.embeds[this.pages[id]];

        this.embeds[this.pages[id]].setFooter({
            text: this.interaction.user.displayName,
            iconURL: this.interaction.user.displayAvatarURL()
        });

        const replyOptions = {
            embeds: [embed],
            components: [this.getRow(id)],
            ephemeral: this.ephemeral,
            fetchReply: true
        };

        const responseEmbed = this.deferReplied
            ? await this.interaction.editReply(replyOptions)
            : await this.interaction.reply(replyOptions);

        const collector = responseEmbed.createMessageComponentCollector({
            time: this.disableTime
        });

        collector.on('collect', async (b) => {
            if (!b) return;

            if (b.user.id !== this.interaction.user.id) {
                const invalidReq = new EmbedBuilder()
                    .setDescription(
                        `${icon.info.redCross} *This message is only for ${userMention(this.interaction.user.id)}*`
                    )
                    .setColor('Red');
                b.reply({ embeds: [invalidReq] });
            }

            const validCustomIds = ['prev_embed', 'next_embed', 'most_prev_embed', 'most_next_embed', 'page-no'];

            if (!validCustomIds.includes(b.customId)) return;

            b.deferUpdate();

            if (b.customId === 'prev_embed' && this.pages[id] > 0) {
                --this.pages[id];
            } else if (b.customId === 'next_embed' && this.pages[id] < this.embeds.length - 1) {
                ++this.pages[id];
            } else if (b.customId === 'most_prev_embed' && this.pages[id] > 0) {
                this.pages[id] = 0;
            } else if (b.customId === 'most_next_embed' && this.pages[id] < this.embeds.length - 1) {
                this.pages[id] = this.embeds.length - 1;
            } else if (b.customId == 'page-no') return;

            this.embeds[this.pages[id]].setFooter({
                text: this.interaction.user.displayName,
                iconURL: this.interaction.user.displayAvatarURL()
            });

            await this.interaction.editReply({
                embeds: [this.embeds[this.pages[id]]],
                components: [this.getRow(id)]
            });
        });

        collector.on('end', async (reason) => {
            let disabledButtons: ButtonBuilder[] = [];
            this.getRow(id).components.forEach((b) => {
                disabledButtons.push(b.setDisabled());
            });

            await this.interaction?.editReply({
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButtons)]
            });
        });
    }
}
