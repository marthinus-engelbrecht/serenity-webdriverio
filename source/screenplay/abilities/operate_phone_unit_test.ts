import {OperatePhone} from './operate_phone';
import {Client, remote} from 'webdriverio';
import {Target} from '../ui';
import {Actor} from '@serenity-js/core/lib/screenplay';
import {Element} from 'webdriverio';

class Differed<T> {
    public resolve: Function;
    public reject: Function;

    public promise: PromiseLike<T>;

    constructor() {
        let resolve: Function;
        let reject: Function;

        this.promise = new Promise((innerResolve, innerReject) => {
            resolve = function (returnValueMock?: T) {
                innerResolve(returnValueMock || undefined);
            };

            reject = function () {
                innerReject();
            }
        });

        this.resolve = resolve;
        this.reject = reject;
    }
}


function setupMocks() {
    let differed = {
        touchElementPromise: new Differed<Element>(),
        setValuePromise: new Differed<void>(),
        elementsPromise: new Differed<Element[]>(),
        elementIdTextPromises: [
            new Differed<string>(),
            new Differed<string>()
        ],
        elementIdClickPromise: new Differed<Element[]>()
    };

    let callCount = 0;

    let clientMock = {
        touch: sinon.spy(function () {
            return differed.touchElementPromise.promise
        }),
        setValue: sinon.spy(function () {
            return differed.setValuePromise.promise
        }),
        elements: sinon.spy(function () {
            return differed.elementsPromise.promise
        }),
        elementIdText: sinon.spy(function () {
            let {promise} = differed.elementIdTextPromises[callCount];
            callCount = callCount + 1;
            return promise;
        }),
        elementIdClick: sinon.spy(function () {
            return differed.elementIdClickPromise.promise
        })
    };

    const remoteMock = new Proxy(remote, {
        apply: function () {
            return clientMock;
        }
    });

    return {
        remoteMock,
        clientMock,
        differed
    }
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

        describe('when the phone is operated as the actor', function () {
            beforeEach(function () {
                OperatePhone.as(actor);
            });

            it('then the actors ability to operate the phone should be used', function () {
                expect(mockedActor.abilityTo).to.have.been.calledWith(OperatePhone);
            });
        });
    });

    describe('Given a wedbdriverio client', function () {
        const {remoteMock, clientMock, differed} = setupMocks();

        let phoneClient: Client<any>;

        beforeEach(function () {
            phoneClient = remoteMock()
        });

        describe('When touch is called with a target', function () {
            const theTarget = Target.called('#doStuff');

            beforeEach(function () {
                OperatePhone.using(phoneClient).touch(theTarget);
            });

            it('it should call phoneClient.touch with the targets selector', function () {
                expect(clientMock.touch).to.have.been.calledWith(theTarget.selector)
            });
        });

        describe('When enterValue is called with a target and a value', function () {
            const theTarget = Target.called('#textField');
            const theValue = 45;
            let operatePhonePromise;

            beforeEach(function () {
                operatePhonePromise = OperatePhone.using(phoneClient).enterValue(theTarget, theValue);
            });

            it('it should call phoneClient.setValue with the target selector', function () {
                expect(clientMock.setValue).to.have.been.calledWith(theTarget.selector, theValue)
            });

            describe('And the action is successful', function () {
                beforeEach(function () {
                    differed.setValuePromise.resolve()
                });

                it('Then it should return a fulfilled promise', async function () {
                    await expect(operatePhonePromise).to.be.fulfilled
                });
            });
        });

        describe('When selectElementFromList is called with a targets selector', function () {
            const expectedSelectedElement = {
                text: 'Magic Beans',
                id: "UniqueElementId2"
            };

            const theTarget = Target.called(',searchResults');

            let operatePhonePromise;

            before(function () {
                operatePhonePromise = OperatePhone.using(phoneClient).selectElementFromList(theTarget, expectedSelectedElement.text);
            });

            it('Then it should call phoneClient.element with the target selector', function () {
                expect(clientMock.elements).to.have.been.calledWith(theTarget.selector)
            });

            describe('And phoneClient.element returns successfully with an array', function () {
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

                    await operatePhonePromise;
                });

                it('Then it should call phoneClient.elementIdText for each element in the array', async function () {
                    elementsMock.forEach(function (elementMock) {
                        expect(clientMock.elementIdText).to.have.been.calledWith(elementMock.ELEMENT)
                    })
                });

                describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {

                    it('Then phoneClient.touchId should be called with the selected element\'s id', function () {
                        expect(clientMock.elementIdClick).to.have.been.calledWith(expectedSelectedElement.id)
                    });
                });
            });
        });
    });
});

