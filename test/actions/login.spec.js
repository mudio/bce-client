/* eslint no-unused-expressions: 0, import/no-extraneous-dependencies: 0 */
import {expect} from 'chai';
import {spy} from 'sinon';
import * as actions from '../../app/bce/actions/login';

describe('actions', () => {
    it('login should create UPDATE_AUTH action', () => {
        const fn = actions.login();
        expect(fn).to.be.a('function');
        const dispatch = spy();
        fn(dispatch);
        expect(dispatch.called).to.be.true;
    });
});
