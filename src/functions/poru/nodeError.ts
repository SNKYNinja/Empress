import { Node } from 'poru';
import chalk from 'chalk';

export const nodeError = async (node: Node, event: any) => {
    const lightRed = '#e60b25';

    const darkRed = '#910616';
    const darkText = '##696869';

    const lightArrow = chalk.bold.hex(lightRed)('➜');
    const darkArrow = chalk.bold.hex(darkRed)('➜');
    const nodeName = node.name + ':';

    console.log(`   ${lightArrow} ${chalk.bold.underline(nodeName)} ${chalk.bold.hex(lightRed)('Not Connected')}`);
    console.log(`   ${darkArrow} ${chalk.bold.hex(darkText)(event)}\n`);
};
