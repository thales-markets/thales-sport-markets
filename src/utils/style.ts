import { kebabCase } from 'lodash';
import { CSSProperties } from 'styled-components';

export const convertCssToStyledProperties = (style: CSSProperties) =>
    Object.keys(style).reduce((accumulator, key) => {
        // transform the key from camelCase to kebab-case
        const cssKey = kebabCase(key);
        const styleValue = style[key as keyof typeof style];
        // remove ' in value
        const cssValue = typeof styleValue === 'string' ? styleValue.replace("'", '') : styleValue;
        // build the result
        // you can break the line, add indent for it if you need
        return `${accumulator}${cssKey}: ${cssValue};`;
    }, '');
