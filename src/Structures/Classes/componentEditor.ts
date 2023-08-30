import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';

interface ButtonData {
    style?: ButtonStyle;
    emoji?: string;
    disabled: boolean;
    label?: string;
}

export class ComponentEditor {
    public message: Message | any;
    constructor(message: Message | any) {
        this.message = message;
    }

    public async setButtonData(row: number, button: number, data: ButtonData) {
        let rows: ActionRowBuilder<ButtonBuilder>[] = [];

        for (let i = 0; i < this.message.components.length; i++) {
            if (i === row) {
                let components = new ActionRowBuilder<ButtonBuilder>();

                for (let j = 0; j < this.message.components[i].components.length; j++) {
                    const btn = ButtonBuilder.from(this.message.components[i].components[j]);

                    if (j === button) {
                        btn.setDisabled(data.disabled);
                        data.label && btn.setLabel(data.label);
                        data.emoji && btn.setEmoji(data.emoji);
                        data.style && btn.setStyle(data.style);
                    }

                    components.addComponents(btn);
                }

                rows.push(components);
            } else {
                rows.push(ActionRowBuilder.from(this.message.components[i]));
            }
        }

        return rows;
    }
}
