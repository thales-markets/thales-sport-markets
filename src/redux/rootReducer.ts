import { combineReducers } from '@reduxjs/toolkit';
import app from './modules/app';
import market from './modules/market';
import quiz from './modules/quiz';
import ticket from './modules/ticket';
import ui from './modules/ui';
import wallet from './modules/wallet';

const rootReducer = combineReducers({
    app,
    wallet,
    ui,
    market,
    quiz,
    ticket,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
