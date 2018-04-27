import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, ServerMock} from '../../../helpers/client_server_mock';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When listIncludes is called with a target that is a list and an item', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const elementToBeFound = {
        text: 'Magic Beans',
        id: "UniqueElementId2"
    };
    const theTarget = Target.called('.searchResults');
    let phoneClient: Client<any>;
    let serverMock: ServerMock;
    let operatePhonePromise;

    beforeEach(function () {
        serverMock = new ServerMock(elementToBeFound);
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).listIncludes(theTarget, elementToBeFound.text);
    });

    it('Then it should call phoneClient.element with the target selector', function () {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector)
    });

    describe('And phoneClient.element returns a fulfilled promise with an array', function () {
        let elementMockIds;

        beforeEach(async function () {
            const response = serverMock.respondTo('elements').withSuccess();
            elementMockIds = response.value.map(element => element.ELEMENT);
        });

        describe('And there is no connection issues', function () {
            beforeEach(async function () {
                await serverMock.connect();
            });

            it('Then it should call phoneClient.elementIdText for each element in the array', async function () {
                expect(phoneClient.elementIdText).to.be.calledWithEach(elementMockIds);
            });

            describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {
                it('Then listIncludes should return a resolved promise with the value true', async function () {
                    await expect(operatePhonePromise).to.eventually.be.true
                });
            });
        });

        describe('And there are connection issues', function () {
            let connectionError;

            beforeEach(function () {
                connectionError = serverMock.disconnect();
            });

            it('Then listIncludes should return a rejected promise with the error', async function () {
                await expect(operatePhonePromise).to.be.rejectedWith(connectionError);
            });
        });

    });

    describe('And phoneClient.element returns a rejected promise with an error', function () {
        let error: Error;

        beforeEach(function () {
            error = serverMock.respondTo('elements').withRejection();
        });

        it('Then listIncludes should return with a rejected promise and the error', async function () {
            await expect(operatePhonePromise).to.be.rejectedWith(error);
        });
    });
});
