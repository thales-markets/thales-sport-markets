import { kebabCase } from 'lodash';
import { CSSProperties } from 'styled-components';

// Converts: paddingLeft: '5px' => padding-left: 5px;
export const convertCssToStyledProperties = (style: CSSProperties) =>
    Object.keys(style).reduce((accumulator, key) => {
        // transform the key from camelCase to kebab-case
        const cssKey = kebabCase(key);
        const styleValue = style[key as keyof typeof style];
        // remove ' in value
        const cssValue = typeof styleValue === 'string' ? styleValue.replace("'", '') : styleValue;

        return `${accumulator}${cssKey}: ${cssValue};`;
    }, '');
