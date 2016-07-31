
import auth from './login';
import explorer from './explorer';
import navigator from './navigator';
import {combineReducers} from 'redux';
import {downloads, uploads} from './transfer';
import {routerReducer as routing} from 'react-router-redux';

const rootReducer = combineReducers({
    auth,
    uploads,
    routing,
    explorer,
    navigator,
    downloads
});

export default rootReducer;
