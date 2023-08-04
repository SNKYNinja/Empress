import boxen, { Options } from 'boxen';

interface ItemOptions {
    name: string;
    value?: string;
}

export default class Boxen {
    constructor() {}

    public async createBox() {
        const arr: string[] = [];
        return arr;
    }

    public async addItem(box: string[], options: ItemOptions) {
        if (options.value) {
            box.push(`${options.name}: ${options.value}`);
        } else {
            box.push(options.name);
        }
    }

    public async addItems(box: string[], options: ItemOptions[]) {
        options.forEach((item) => {
            if (item.value) {
                box.push(`${item.name}: ${item.value}`);
            } else {
                box.push(item.name);
            }
        });
    }

    public async addItemStart(box: string[], options: ItemOptions) {
        if (options.value) {
            box.unshift(`${options.name}: ${options.value}`);
        } else {
            box.unshift(options.name);
        }
    }

    public async showBox(box: string[], options: Options) {
        return console.log(boxen(box.join('\n'), options));
    }
}
