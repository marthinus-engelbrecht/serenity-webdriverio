import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, ServerMock} from '../../../helpers/client_server_mock';
import {ignoreExpectedUnhandledRejection} from './helpers';
import {OperatePhone, Target} from '../../../../source/screenplay';


describe('When selectElementFromList is called with a targets selector', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const elementToBeSelected = {
        text: 'Magic Beans',
        id: 'UniqueElementId2'
    };
    const theTarget = Target.called('.searchResults');
    let phoneClient: Client<any>;
    let serverMock: ServerMock;
    let operatePhonePromise;

    beforeEach(function () {
        serverMock = new ServerMock(elementToBeSelected);
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).selectElementFromList(theTarget, elementToBeSelected.text);
    });

    it('Then it should call phoneClient.element with the target selector', function () {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector)
    });

    describe('And phoneClient.element returns a fulfilled promise with an array', function () {
        let elementMockIds: Array<string>;

        beforeEach(function () {
            const response = serverMock.respondTo('elements').withSuccess();
            elementMockIds = response.value.map(element => element.ELEMENT)
        });

        describe('And there is no connection issues', function () {
            beforeEach(async function () {
                await serverMock.connect();
            });

            it('Then it should call phoneClient.elementIdText for each element in the array', function () {
                expect(phoneClient.elementIdText).to.be.calledWithEach(elementMockIds);
            });

            describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {
                it('Then phoneClient.touchId should be called with the selected element\'s id', function () {
                    expect(phoneClient.elementIdClick).to.have.been.calledWith(elementToBeSelected.id)
                });

                describe('And phoneClient.elementIdClick was successful', function () {
                    beforeEach(function () {
                        serverMock.respondTo('elementIdClick').withSuccess();
                    });

                    it('Then selectElementFromList should return a resolved promise with the value undefined', async function () {
                        await expect(operatePhonePromise).to.eventually.equal(undefined);
                    });
                });

                describe('And phoneClient.elementIdClick was a failure', function () {
                    let error;

                    beforeEach(function () {
                        error = serverMock.respondTo('elementIdClick').withRejection()
                    });

                    it('Then selectElementFromList should return with a rejected promise', async function () {
                        await expect(operatePhonePromise).to.be.rejectedWith(error)
                    });
                });
            });
        });

        describe('And there are connection issues', function () {
            let connectionError;

            beforeEach(function () {
                connectionError = serverMock.disconnect();
            });

            it('Then selectElementFromList should return a rejected promise with the error', async function () {
                await expect(operatePhonePromise).to.be.rejectedWith(connectionError);
            });

            it('Then phoneClient.touchId should never be called', async function () {
                await ignoreExpectedUnhandledRejection(operatePhonePromise, connectionError);
                expect(phoneClient.elementIdClick).to.have.not.been.called
            });
        });
    });

    describe('And phoneClient.element returns a rejected promise with an error', function () {
        let error;

        beforeEach(function () {
            error = serverMock.respondTo('elements').withRejection();
        });

        it('Then selectElementFromList should return with a rejected promise and the error', async function () {
            await expect(operatePhonePromise).to.be.rejectedWith(error);
        });
    });
});
