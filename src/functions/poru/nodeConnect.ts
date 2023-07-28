import { Node } from 'poru';
import ora from 'ora';
import chalk from 'chalk';

export const nodeConnect = async (node: Node) => {
    console.log(chalk.redBright.bold(`[NODE]`) + ` ${node.name} has been loaded successfully`);
    // const spinner = ora(`Connecting to ${node.name}`).start();
    // setTimeout(() => {
    //     spinner.color = 'yellow';
    //     spinner.text = `${chalk.bold.yellow('[NODE]')} Connected to ${node.name}`;
    // }, 10 * 1000);
};
