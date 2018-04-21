import {OperatePhone} from './operate_phone';
import {Client, remote} from 'webdriverio';
import {Target} from '../ui';
import {Actor} from '@serenity-js/core/lib/screenplay';




describe('Unit Test: OperatePhone', function () {
    let resolve: Function;

    let promise = new Promise(innerResolve => {
        resolve = function() {
            console.log('Resolving thigns');
            innerResolve();
        }
    });

    const mockClient = {
        touch() {
        },

        setValue() {
        }
    };

    const mockRemote = new Proxy(remote, {
        apply: function () {
            mockClient.touch = sinon.spy(function () {
                return new Promise(resolve => resolve())
            });
            mockClient.setValue = sinon.spy(function () {
                return promise
            });
            return mockClient
        }
    });

    describe('Given an actor', function () {
        let actor;
        const mockedActor = {
            abilityTo: {

            }
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
        let phoneClient: Client<any>;

        beforeEach(function () {
            phoneClient = mockRemote()
        });

        describe('when touch is called with a target', function () {
            const theTarget = Target.called('#doStuff');

            beforeEach(function () {
                OperatePhone.using(phoneClient).touch(theTarget);
            });

            it('it should call phoneClient.touch with the targets selector', function () {
                expect(mockClient.touch).to.have.been.calledWith(theTarget.selector)
            });
        });

        describe('when enterValue is called with a target and a value', function () {
            const theTarget = Target.called('#textField');
            const theValue = 45;
            let operatePhonePromise;

            beforeEach(function () {
                operatePhonePromise = OperatePhone.using(phoneClient).enterValue(theTarget, theValue);
            });

            it('it should call phoneClient.setValue with the target selector', function () {
                expect(mockClient.setValue).to.have.been.calledWith(theTarget.selector, theValue)
            });

            describe('And the action is successful', function () {
                beforeEach(function () {
                    resolve()
                });

                it('Then it should return a fulfilled promise',async function () {
                    await expect(operatePhonePromise).to.be.fulfilled
                });
            });
        });
    });
});

