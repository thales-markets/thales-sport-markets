import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getTheme } from 'redux/modules/ui';
import { ThemeProvider } from 'styled-components';
import { ThemeMap } from 'constants/ui';

type ThemeProps = {
    children: React.ReactNode;
};

const Theme: React.FC<ThemeProps> = ({ children }) => {
    const theme = useSelector((state: RootState) => getTheme(state));

    return <ThemeProvider theme={ThemeMap[theme]}>{children}</ThemeProvider>;
};

export default Theme;
