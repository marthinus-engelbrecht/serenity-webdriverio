import {OperatePhone} from '../../../../source/screenplay';
import {Actor} from '@serenity-js/core/lib/screenplay';

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
});