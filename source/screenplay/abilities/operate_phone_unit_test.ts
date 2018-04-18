import {OperatePhone} from './operate_phone';
import {Client, remote} from 'webdriverio';
import {Target} from '../ui';

describe('Unit Test: OperatePhone', function () {
    let mockClient = {
        touch() {}
    };

    let mockRemote = new Proxy(remote, {
        apply: function(){
            mockClient.touch = sinon.spy();
            return mockClient
        }
    });

    describe('Given a wedbdriverio client', function () {
        let phoneClient: Client<any>;

        beforeEach(function () {
            phoneClient = mockRemote()
        });

        describe('when touch is called with a target', function () {
            beforeEach(function () {
                OperatePhone.using(phoneClient).touch(Target.called('#doStuff'));
            });

            it('it should call phoneClient.touch with the target', function () {
                expect(mockClient.touch).to.have.been.calledOnce
            });
        });
    });
});

