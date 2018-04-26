import {Client, Element, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock, differed} from '../../../helpers/phoneClientMock';
import {ignoreExpectedUnhandledRejection, simulateConnectionFailure} from './helpers';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When selectElementFromList is called with a targets selector', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const expectedSelectedElement = {
        text: 'Magic Beans',
        id: "UniqueElementId2"
    };
    const theTarget = Target.called('.searchResults');
    let phoneClient: Client<any>;
    let operatePhonePromise;

    beforeEach(function () {
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).selectElementFromList(theTarget, expectedSelectedElement.text);
    });

    it('Then it should call phoneClient.element with the target selector', function () {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector)
    });

    describe('And phoneClient.element returns a fulfilled promise with an array', function () {
        const elementsMock: Element[] = [
            {
                ELEMENT: "UniqueElementId1",
            },
            {
                ELEMENT: expectedSelectedElement.id
            },
        ];

        const elementIdTextResponseMockArray = [
            {
                value: "FLEECE OF GIDEON"
            },
            {
                value: expectedSelectedElement.text
            }
        ];

        const responseMockElements = {
            value: elementsMock
        };

        beforeEach(function () {
            differed.elements.resolve(responseMockElements);
        });

        describe('And there is no connection issues', function () {
            beforeEach(async function () {
                elementIdTextResponseMockArray.forEach((elementIdTextResponseMock, index) => {
                    differed.elementIdText[index].resolve(elementIdTextResponseMock)
                });

                await Promise.all(differed.elementIdText.map(item => item.promise));
            });

            it('Then it should call phoneClient.elementIdText for each element in the array', function () {
                elementsMock.forEach(function (elementMock) {
                    expect(phoneClient.elementIdText).to.have.been.calledWith(elementMock.ELEMENT)
                })
            });

            describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {
                it('Then phoneClient.touchId should be called with the selected element\'s id', function () {
                    expect(phoneClient.elementIdClick).to.have.been.calledWith(expectedSelectedElement.id)
                });

                describe('And phoneClient.elementIdClick was successful', function () {
                    beforeEach(function () {
                        differed.elementIdClick.resolve('I was touched')
                    });

                    it('Then selectElementFromList should return a resolved promise with the value undefined', async function () {
                        await expect(operatePhonePromise).to.eventually.equal(undefined);
                    });
                });
            });
        });

        describe('And there are connection issues', function () {
            const connectionError = 'Cannot connect to port 8246, access denied';

            beforeEach(function () {
                simulateConnectionFailure(differed, elementIdTextResponseMockArray, connectionError);
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
        const error = 'Can\'t do it captain I don\'t have the power';
        beforeEach(function () {
            differed.elements.reject(error)
        });

        it('Then selectElementFromList should return with a rejected promise and the error', async function () {
            await expect(operatePhonePromise).to.be.rejectedWith(error);
        });
    });
});
