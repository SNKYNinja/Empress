import { ButtonInterface, SelectMenuInterface } from "@/typings";
import { DiscordClient } from "@/bot";

import { glob } from "glob";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, "..");

export class ComponentInteractionHandler {
    constructor() { }

    public async loadButtons(client: DiscordClient) {
        const buttonDir = await glob(`${baseDir}/component/buttons/*/*{.ts,.js}`);

        await Promise.all(
            buttonDir.map(async (file) => {
                const buttonPath = path.resolve(file);
                const button: ButtonInterface = (await import(`${pathToFileURL(buttonPath)}`))
                    .default;

                client.buttons.set(button.id, button);
            })
        );
    }

    public async loadSelectMenus(client: DiscordClient) {
        const menuDir = await glob(`${baseDir}/component/selectMenus/*/*{.ts,.js}`);

        await Promise.all(
            menuDir.map(async (file) => {
                const selectMenuPath = path.resolve(file);
                const menu: SelectMenuInterface = (await import(`${pathToFileURL(selectMenuPath)}`))
                    .default;

                client.selectMenus.set(menu.id, menu);
            })
        );
    }
}
