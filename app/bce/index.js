import React from 'react';
import {remote} from 'electron';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';

import Root from './containers/Root';
import {configureStore, history} from './store/configureStore';
import './style/mixin.global.css';

export default class BceModule {
    static startup(containerNode) {
        const cache = JSON.parse(localStorage.getItem('framework')) || {};

        if (localStorage.getItem('version') !== remote.app.getVersion()) {
            localStorage.clear();
            localStorage.setItem('version', remote.app.getVersion());
        }

        const store = configureStore(cache);
        store.subscribe(() => {
            const {auth} = store.getState();
            const config = JSON.stringify({auth});
            localStorage.setItem('framework', config);
        });

        window.globalStore = store;

        render(
            <AppContainer>
                <Root store={store} history={history} />
            </AppContainer>,
            containerNode
        );

        if (module.hot) {
            module.hot.accept('./containers/Root', () => {
                const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
                render(
                    <AppContainer>
                        <NextRoot store={store} history={history} />
                    </AppContainer>,
                    containerNode
                );
            });
        }
    }
}
