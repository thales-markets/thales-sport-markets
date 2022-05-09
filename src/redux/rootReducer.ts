import { combineReducers } from '@reduxjs/toolkit';
import ui from './modules/ui';
import wallet from './modules/wallet';
import app from './modules/app';
import market from './modules/market';

const rootReducer = combineReducers({
    app,
    wallet,
    ui,
    market,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
