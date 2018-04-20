import {Target} from '../ui';
import {OperatePhone} from '../abilities';
import {Touch} from './touch';
import {remote} from 'webdriverio'
import {Actor} from '@serenity-js/core/lib/screenplay';

let OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
    apply: function () {
        return {
            touch: sinon.spy(),
            constructor: {
                name: "OperatePhone"
            }
        }
    }
});

let icon = Target.called("#icon");

describe('Unit Test: Touch', function () {
    describe('Given a target', function () {
        describe('When the target is touched by an actor', function () {
            let operatePhone: OperatePhone;

            beforeEach(function () {
                operatePhone = OperatePhoneUsingMock(remote());
                Touch.the(icon).performAs(Actor.named('Jack').whoCan(operatePhone));
            });

            it('Then OperatePhone.touch function should be executed with the target', function () {
                expect(operatePhone.touch).to.have.been.calledWith(icon);
            });
        });
    });
});