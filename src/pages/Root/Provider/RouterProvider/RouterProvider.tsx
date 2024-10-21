import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ifIpfsDeployment } from 'utils/routes';

type RouterProviderProps = {
    children: React.ReactNode;
};

const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
    return ifIpfsDeployment ? <HashRouter>{children}</HashRouter> : <BrowserRouter>{children}</BrowserRouter>;
};

export default RouterProvider;
