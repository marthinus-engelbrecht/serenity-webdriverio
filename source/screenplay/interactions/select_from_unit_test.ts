import {remote} from "webdriverio";
import {SelectFrom} from './select_from';
import {Actor} from '@serenity-js/core/lib/screenplay';
import {OperatePhone} from '../abilities';
import {Target} from '../ui';

let OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
    apply: function () {
        return {
            selectElementFromList: sinon.spy(),
            constructor: {
                name: "OperatePhone"
            }
        }
    }
});

let searchResults = Target.called(".SearchResults");

describe('Unit Test: SelectFrom', function () {
    describe('Given a target', function () {
        describe('When the an actor select an item from a list', function () {
            let operatePhone: OperatePhone;
            const text = 'Magic Beans';

            beforeEach(function () {
                operatePhone = OperatePhoneUsingMock(remote());
                SelectFrom.the(searchResults).itemContaining(text).performAs(Actor.named('Jack').whoCan(operatePhone));
            });

            it('Then OperatePhone.selectElementFromList function should be executed with the target and filtering text', function () {
                expect(operatePhone.selectElementFromList).to.have.been.calledWith(searchResults, text);
            });
        });
    });
});