import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, differed} from '../../../helpers/phoneClientMock';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When enterValue is called with a target and a value', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const theTarget = Target.called('#textField');
    const theValue = 45;
    let phoneClient: Client<any>;
    let operatePhonePromise;

    beforeEach(function () {
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).enterValue(theTarget, theValue);
    });

    it('it should call phoneClient.setValue with the target selector', function () {
        expect(phoneClient.setValue).to.have.been.calledWith(theTarget.selector, theValue)
    });

    describe('And the value was set successfully', function () {
        beforeEach(function () {
            differed.setValue.resolve()
        });

        it('Then it should return a fulfilled promise', async function () {
            await expect(operatePhonePromise).to.eventually.equal(undefined)
        });
    });

    describe('And it failed to set the value', function () {
        const cantBeFoundErr = 'Can\'t find it man';

        beforeEach(function () {
            differed.setValue.reject(cantBeFoundErr)
        });

        it('Then it should return a rejected promise with the error', async function () {
            await expect(operatePhonePromise).to.be.rejectedWith(cantBeFoundErr)
        });
    });
});
