import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, ServerMock, SupportedClientMethods} from '../../../helpers/client_server_mock';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When touch is called with a target', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    let phoneClient: Client<any>;
    let touchResponsePromise: Promise<void>;
    let serverMock : ServerMock;
    const theTarget = Target.called('#doStuff');

    beforeEach(function () {
        serverMock = new ServerMock();
        phoneClient = remoteMock();
        touchResponsePromise = OperatePhone.using(phoneClient).touch(theTarget);
    });

    it('it should call phoneClient.touch with the targets selector', function () {
        expect(phoneClient.touch).to.have.been.calledWith(theTarget.selector)
    });

    describe('And the target is successfully touched', function () {
        beforeEach(function () {
            serverMock.respondTo('touchElement').withSuccess()
        });

        it('Then phoneClient.touch should resolve with undefined', async function () {
            await expect(touchResponsePromise).to.eventually.equal(undefined)
        });
    });

    describe('And the target cannot be found', function () {
        let error;

        beforeEach(function () {
            error = serverMock.respondTo('touchElement').withRejection()
        });

        it('Then phoneClient.touch should resolve with undefined', async function () {
            await expect(touchResponsePromise).to.rejectedWith(error)
        });
    })
});
