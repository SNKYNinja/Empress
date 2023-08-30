import { ButtonInterface, SelectMenuInterface } from 'Typings';
import { DiscordClient } from 'bot';

import { glob } from 'glob';
import { pathToFileURL } from 'node:url';
import path from 'path';

import Boxen from 'Structures/Classes/boxen';
import chalk from 'chalk';

export class ComponentInteractionHandler {
    constructor() {}

    public async loadButtons(client: DiscordClient, IBox?: Boxen, BoxContents?: string[]) {
        const ButtonDir = await glob(`${process.cwd()}/dist/Component/Buttons/*/*{.ts,.js}`);
        let buttonStatus: string = chalk.bold.hex('#43B383')('OK');

        await Promise.all(
            ButtonDir.map(async (file) => {
                const buttonPath = path.resolve(file);
                const button: ButtonInterface = (await import(`${pathToFileURL(buttonPath)}`)).default;

                if (!button) {
                    buttonStatus = `${chalk.bold.red('Failed')} ${chalk.underline(
                        file.split('\\').slice(2).join('/')
                    )}`;
                    return;
                }

                client.buttons.set(button.id, button);
            })
        );

        if (IBox && BoxContents) {
            IBox.addItem(BoxContents, {
                name: `${chalk.white('Buttons')}`,
                value: ' ' + buttonStatus
            });
        }
    }

    public async loadSelectMenus(client: DiscordClient, IBox?: Boxen, BoxContents?: string[]) {
        const SelectMenuDir = await glob(`${process.cwd()}/dist/Component/SelectMenus/*/*{.ts,.js}`);
        let selectMenuStatus: string = chalk.bold.hex('#43B383')('OK');

        await Promise.all(
            SelectMenuDir.map(async (file) => {
                const selectMenuPath = path.resolve(file);
                const menu: SelectMenuInterface = (await import(`${pathToFileURL(selectMenuPath)}`)).default;

                if (!menu) {
                    selectMenuStatus = `${chalk.bold.red('Failed')} ${chalk.underline(
                        file.split('\\').slice(2).join('/')
                    )}`;
                    return;
                }

                client.selectMenus.set(menu.id, menu);
            })
        );

        if (IBox && BoxContents) {
            IBox.addItem(BoxContents, {
                name: `${chalk.white('Select')}`,
                value: ' '.repeat(2) + selectMenuStatus
            });
        }
    }
}
