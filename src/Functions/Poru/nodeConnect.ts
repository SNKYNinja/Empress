import { Node } from 'poru';
import chalk from 'chalk';

export const nodeConnect = async (node: Node, elapsedTime: number) => {
    const lightGreen = '#09bb74';

    const darkGreen = '##045c3b';
    const darkText = '##696869';

    const lightArrow = chalk.bold.hex(lightGreen)('➜');
    const darkArrow = chalk.bold.hex(darkGreen)('➜');
    const nodeName = node.name + ':';

    elapsedTime = (Date.now() - elapsedTime) / 1000;

    console.log(`   ${lightArrow} ${chalk.bold.underline(nodeName)} ${chalk.bold.hex(lightGreen)(node.restURL)}`);
    console.log(`   ${darkArrow} ${chalk.bold.hex(darkText)('Ready in')} ${elapsedTime} sec\n`);
};
