import 'i18n';
import Root from 'pages/Root';
import React from 'react';
import ReactDOM from 'react-dom/client';
import store from 'redux/store';
import 'styles/main.css';
import 'styles/overrides.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.Fragment>
        <Root store={store} />
    </React.Fragment>
);
