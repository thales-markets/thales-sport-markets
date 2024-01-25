import React from 'react';
import ReactDOM from 'react-dom';
import Root from 'pages/Root';
import store from 'redux/store';
import 'i18n';
import 'styles/main.css';
import 'styles/overrides.css';
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
    <React.Fragment>
        <Root store={store} />
    </React.Fragment>,
    document.getElementById('root')
);

// serviceWorkerRegistration.register();
