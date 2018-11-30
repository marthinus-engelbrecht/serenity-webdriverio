import {Actor} from "@serenity-js/core/lib/screenplay";
import {OperatePhone} from "../../../../source/screenplay";

describe("Unit Test: OperatePhone", function(): void {
    describe("Given an actor", function(): void {
        let actor: Actor;
        const mockedActor = {
            abilityTo: {},
        };

        beforeEach(function(): void {
            const ActorProxy = new Proxy(Actor.named, {
                apply(): any {
                    mockedActor.abilityTo = sinon.spy();
                    return mockedActor;
                },
            });

            actor = ActorProxy("actor");
        });

        describe("When the phone is operated as the actor", function(): void {
            beforeEach(function(): void {
                OperatePhone.as(actor);
            });

            it("then the actors ability to operate the phone should be used", function(): void {
                expect(mockedActor.abilityTo).to.have.been.calledWith(OperatePhone);
            });
        });
    });
});