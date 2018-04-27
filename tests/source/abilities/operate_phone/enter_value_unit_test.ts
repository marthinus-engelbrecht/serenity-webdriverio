import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, ServerMock} from '../../../helpers/client_server_mock';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When enterValue is called with a target and a value', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const theTarget = Target.called('#textField');
    const theValue = 45;
    let serverMock: ServerMock;
    let phoneClient: Client<any>;
    let operatePhonePromise;

    beforeEach(function () {
        serverMock = new ServerMock();
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).enterValue(theTarget, theValue);
    });

    it('it should call phoneClient.setValue with the target selector', function () {
        expect(phoneClient.setValue).to.have.been.calledWith(theTarget.selector, theValue)
    });

    describe('And the value was set successfully', function () {
        beforeEach(function () {
            serverMock.respondTo('setValue').withSuccess()
        });

        it('Then it should return a fulfilled promise', async function () {
            await expect(operatePhonePromise).to.eventually.equal(undefined)
        });
    });

    describe('And it failed to set the value', function () {
        let error;

        beforeEach(function () {
            error = serverMock.respondTo('setValue').withRejection()
        });

        it('Then it should return a rejected promise with the error', async function () {
            await expect(operatePhonePromise).to.be.rejectedWith(error)
        });
    });
});
