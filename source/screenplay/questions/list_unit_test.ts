import {remote} from "webdriverio";
import {List} from './list';
import {Actor} from '@serenity-js/core/lib/screenplay';
import {OperatePhone} from '../abilities';
import {Target} from '../ui';
import {Differed} from '../../testHelpers/differed';

describe('Unit Test: List', function () {
    describe('Given a list', function () {
        describe('When an actor questions whether an item is in the list', function () {
            const differedAnswer = new Differed<boolean>();

            let OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
                apply: function () {
                    return {
                        listIncludes: sinon.spy(function () {
                            return differedAnswer.promise;
                        }),
                        constructor: {
                            name: "OperatePhone"
                        }
                    }
                }
            });

            let answerPromise: PromiseLike<boolean>;
            const expectedAnswer = true;
            const operatePhone = OperatePhoneUsingMock(remote());
            const item = 'Magic Beans';
            const magicItemsOwned = Target.called('.magicItemsOwned');
            const listIncludesQuestion = List.of(magicItemsOwned).includes(item);
            const actorJack = Actor.named('Jack').whoCan(operatePhone);

            beforeEach(function () {
                answerPromise = listIncludesQuestion.answeredBy(actorJack);
            });

            it('Then OperatePhone.listIncludes should have be called with the item and list', function () {
                expect(operatePhone.listIncludes).to.have.been.calledWith(magicItemsOwned, item);
            });

            describe('and OperatePhone.listIncludes is successful', function () {
                it('Then actor should receive the answer', function () {
                    expect(answerPromise).to.eventually.equal(expectedAnswer)
                });
            });
        });
    });
});