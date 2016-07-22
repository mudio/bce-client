import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import counter from './counter';
import explorer from './explorer';
import navigator from './navigator';
import auth from './login';
import {downloads, uploads} from './transfer';

const rootReducer = combineReducers({
    auth,
    uploads,
    routing,
    counter,
    explorer,
    navigator,
    downloads
});

export default rootReducer;
