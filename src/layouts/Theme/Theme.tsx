import { ThemeMap } from 'constants/ui';
import React from 'react';
import { useSelector } from 'react-redux';
import { getTheme } from 'redux/modules/ui';
import { ThemeProvider } from 'styled-components';
import { RootState } from 'types/redux';

type ThemeProps = {
    children: React.ReactNode;
};

const Theme: React.FC<ThemeProps> = ({ children }) => {
    const theme = useSelector((state: RootState) => getTheme(state));

    return <ThemeProvider theme={ThemeMap[theme]}>{children}</ThemeProvider>;
};

export default Theme;
