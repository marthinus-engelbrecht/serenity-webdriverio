import {remote} from "webdriverio";
import {OperatePhone, SelectFrom, Target} from '../../../../source/screenplay';
import {Actor} from '@serenity-js/core/lib/screenplay';
import {Differed} from '../../../helpers/differed';

let selectElementFromListDifferedPromise;

let OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
    apply: function () {
        return {
            selectElementFromList: sinon.spy(function () {
                selectElementFromListDifferedPromise = new Differed<void>();
                return selectElementFromListDifferedPromise.promise;
            }),
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
            let selectFromPromise: Promise<void>;

            const text = 'Magic Beans';

            beforeEach(function () {
                operatePhone = OperatePhoneUsingMock(remote());
                selectFromPromise = SelectFrom.the(searchResults).itemContaining(text).performAs(Actor.named('Jack').whoCan(operatePhone));
            });

            it('Then OperatePhone.selectElementFromList function should be executed with the target and filtering text', function () {
                expect(operatePhone.selectElementFromList).to.have.been.calledWith(searchResults, text);
            });

            describe('And the item is found', function () {
                beforeEach(function () {
                    selectElementFromListDifferedPromise.resolve();
                });

                it('Then the promise should resolve with undefined', async function () {
                    await expect(selectFromPromise).to.eventually.be.undefined
                });
            });

            describe('And the item is not found', function () {
                beforeEach(function () {
                    selectElementFromListDifferedPromise.reject()
                });

                it('Then the promise should be rejected with undefined', async function () {
                    await expect(selectFromPromise).to.be.rejectedWith(undefined);
                });
            });
        });
    });
});


