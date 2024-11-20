import 'i18n';
import Root from 'pages/Root';
import React from 'react';
import ReactDOM from 'react-dom/client';
import store from 'redux/store';
import 'styles/currencies.css';
import 'styles/fonts.css';
import 'styles/homepage-icons.css';
import 'styles/icons.css';
import 'styles/main.css';
import 'styles/overrides.css';
import 'styles/thales-sidebar-icons.css';
import 'styles/tooltip.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.Fragment>
        <Root store={store} />
    </React.Fragment>
);
