import {OperatePhone} from './operate_phone';
import {Client, remote} from 'webdriverio';
import {Target} from '../ui';
import {Actor} from '@serenity-js/core/lib/screenplay';
import {Element} from 'webdriverio';
import {Differed} from '../../testHelpers/differed';

class DifferedOperatePhoneMethodPromises {
    public touchElementPromise: Differed<Element>;
    public setValuePromise: Differed<void>;
    public elementsPromise = new Differed<Element[]>();
    public elementIdTextPromises: Differed<string>[];

    public elementIdClickPromise = new Differed<Element[]>();
}

let differed: DifferedOperatePhoneMethodPromises;

interface Constructor<T> {
    new (...args): T;
}

class ClientMock {
    private elementIdTextCallCount = 0;

    constructor() {
        differed = new DifferedOperatePhoneMethodPromises();
        differed.elementIdTextPromises = [
            new Differed<string>(),
            new Differed<string>()
        ];
        differed.touchElementPromise = new Differed<Element>();
        differed.setValuePromise = new Differed<void>();
    }

    touch = sinon.spy(() => {
        return differed.touchElementPromise.promise
    });

    setValue = sinon.spy(() => {
        return differed.setValuePromise.promise
    });

    elements = sinon.spy(() => {
        return differed.elementsPromise.promise
    });

    elementIdText = sinon.spy(() => {
        let {promise} = differed.elementIdTextPromises[this.elementIdTextCallCount];
        this.elementIdTextCallCount = this.elementIdTextCallCount + 1;
        return promise;
    });

    elementIdClick = sinon.spy(() => {
        return differed.elementIdClickPromise.promise
    });
}

function createMethodMock(methodName: Function, ResponseConstructor: Constructor<any>) {
    return new Proxy(methodName, {
        apply: function () {
            return new ResponseConstructor();
        }
    });

}

function handleExpectedError(error, connectionError: string) {
    if (error !== connectionError) {
        throw error
    }
}

function simulateConnectionFailure(differed: DifferedOperatePhoneMethodPromises, elementIdTextResponseMockArray, connectionError: string) {
    differed.elementIdTextPromises[0].resolve(elementIdTextResponseMockArray[0]);
    differed.elementIdTextPromises[1].reject(connectionError);
}

async function ignoreExpectedUnhandledRejection(operatePhonePromise, expectedError) {
    await operatePhonePromise
        .catch(error => handleExpectedError(error, expectedError));
}

describe('Unit Test: OperatePhone', function () {
    describe('Given an actor', function () {
        let actor;
        const mockedActor = {
            abilityTo: {}
        };

        beforeEach(function () {
            let ActorProxy = new Proxy(Actor.named, {
                apply: function () {
                    mockedActor.abilityTo = sinon.spy();
                    return mockedActor;
                }
            });

            actor = ActorProxy('actor')
        });

        describe('When the phone is operated as the actor', function () {
            beforeEach(function () {
                OperatePhone.as(actor);
            });

            it('then the actors ability to operate the phone should be used', function () {
                expect(mockedActor.abilityTo).to.have.been.calledWith(OperatePhone);
            });
        });
    });

    describe('Given a wedbdriverio client', function () {
        describe('When touch is called with a target', function () {
            const remoteMock = createMethodMock(remote, ClientMock);
            let phoneClient: Client<any>;
            let touchResponsePromise: Promise<void>;
            const theTarget = Target.called('#doStuff');

            beforeEach(function () {
                phoneClient = remoteMock();
                touchResponsePromise = OperatePhone.using(phoneClient).touch(theTarget);
            });

            it('it should call phoneClient.touch with the targets selector', function () {
                expect(phoneClient.touch).to.have.been.calledWith(theTarget.selector)
            });

            describe('And the target is successfully touched', function () {
                beforeEach(function () {
                    differed.touchElementPromise.resolve();
                });

                it('Then phoneClient.touch should resolve with undefined', async function () {
                    await expect(touchResponsePromise).to.eventually.equal(undefined)
                });
            });

            describe('And the target cannot be found', function () {
                const cantBeFoundErr = 'Can\'t find it man';

                beforeEach(function () {
                    differed.touchElementPromise.reject(cantBeFoundErr);
                });

                it('Then phoneClient.touch should resolve with undefined', async function () {
                    await expect(touchResponsePromise).to.rejectedWith(cantBeFoundErr)
                });
            })
        });

        describe('When enterValue is called with a target and a value', function () {
            const remoteMock = createMethodMock(remote, ClientMock);
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
                    differed.setValuePromise.resolve()
                });

                it('Then it should return a fulfilled promise', async function () {
                    await expect(operatePhonePromise).to.eventually.equal(undefined)
                });
            });

            describe('And it failed to set the value', function () {
                const cantBeFoundErr = 'Can\'t find it man';

                beforeEach(function () {
                    differed.setValuePromise.reject(cantBeFoundErr)
                });

                it('Then it should return a rejected promise with the error', async function () {
                    await expect(operatePhonePromise).to.be.rejectedWith(cantBeFoundErr)
                });
            });
        });

        describe('When selectElementFromList is called with a targets selector', function () {
            const remoteMock = createMethodMock(remote, ClientMock);
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

            describe('And phoneClient.element returns a fulfilled promise with and array', function () {
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

                beforeEach( function () {
                    differed.elementsPromise.resolve(responseMockElements);
                });

                describe('And there is no connection issues', function () {
                    beforeEach(async function () {
                        elementIdTextResponseMockArray.forEach((elementIdTextResponseMock, index) => {
                            differed.elementIdTextPromises[index].resolve(elementIdTextResponseMock)
                        });

                        await Promise.all(differed.elementIdTextPromises.map(item => item.promise));
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

                        describe('And phoneClient.elementIdClick was successful',  function () {
                            beforeEach(function () {
                                differed.elementIdClickPromise.resolve('I was touched')
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
                    differed.elementsPromise.reject(error)
                });

                it('Then selectElementFromList should return with a rejected promise and the error', async function () {
                    await expect(operatePhonePromise).to.be.rejectedWith(error);
                });
            });
        });

        describe('When listIncludes is called with a target that is a list and an item', function () {
            const remoteMock = createMethodMock(remote, ClientMock);
            const expectedSelectedElement = {
                text: 'Magic Beans',
                id: "UniqueElementId2"
            };
            const theTarget = Target.called('.searchResults');
            let phoneClient: Client<any>;
            let operatePhonePromise;

            before(function () {
                phoneClient = remoteMock();
                operatePhonePromise = OperatePhone.using(phoneClient).listIncludes(theTarget, expectedSelectedElement.text);
            });

            it('Then it should call phoneClient.element with the target selector', function () {
                expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector)
            });

            describe('And phoneClient.element returns successfully with an array', function () {
                let returnValue;

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

                beforeEach(async function () {
                    differed.elementsPromise.resolve(responseMockElements);

                    elementIdTextResponseMockArray.forEach((elementIdTextResponseMock, index) => {
                        differed.elementIdTextPromises[index].resolve(elementIdTextResponseMock)
                    });

                    differed.elementIdClickPromise.resolve();

                    returnValue = await operatePhonePromise;
                });

                it('Then it should call phoneClient.elementIdText for each element in the array', async function () {
                    elementsMock.forEach(function (elementMock) {
                        expect(phoneClient.elementIdText).to.have.been.calledWith(elementMock.ELEMENT)
                    })
                });

                describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {

                    it('Then listIncludes should return true', function () {
                        expect(returnValue).to.be.true
                    });
                });
            });
        });
    });
});

