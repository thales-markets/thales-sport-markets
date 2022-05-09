import { ThemeInterface } from 'types/ui';

declare module 'styled-components' {
    interface DefaultTheme extends ThemeInterface {}
}
