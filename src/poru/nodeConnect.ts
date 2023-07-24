import { Node } from 'poru';
import chalk from 'chalk';

export const nodeConnect = async (node: Node) => {
    console.log(chalk.redBright.bold(`[NODE]`) + ` ${node.name} has been loaded successfully`);
};
