import {Target} from '../ui';
import {OperatePhone} from '../abilities';
import {remote} from 'webdriverio'
import {Actor} from '@serenity-js/core/lib/screenplay';
import {Types} from './types';

let OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
    apply: function () {
        return {
            enterValue: sinon.spy(),
            constructor: {
                name: "OperatePhone"
            }
        }
    }
});

const searchBox = Target.called("#searchBox");

describe('Unit Test: Types', function () {
    describe('Given a target', function () {
        describe('When an actor types a value into a target', function () {
            let operatePhone: OperatePhone;
            const theValue = "peanutbutter";

            beforeEach(function () {
                operatePhone = OperatePhoneUsingMock(remote());
                Types.theValue(theValue).into(searchBox).performAs(Actor.named('Jack').whoCan(operatePhone));
            });

            it('Then the value should be entered into the target', function () {
                expect(operatePhone.enterValue).to.have.been.calledWith(searchBox, theValue);
            });

            // it('Then the value should be entered into the target', function () {
            //     expect(operatePhone.enterValue).to.have.been.calledWith(theValue, searchBox);
            // });
        });
    });
});