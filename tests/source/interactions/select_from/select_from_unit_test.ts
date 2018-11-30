import {Actor} from "@serenity-js/core/lib/screenplay";
import {remote} from "webdriverio";
import {OperatePhone, SelectFrom, Target} from "../../../../source/screenplay";
import {Differed} from "../../../helpers/differed";

let selectElementFromListDifferedPromise: Differed<void>;

const OperatePhoneUsingMock = new Proxy(OperatePhone.using, {
    apply(): any {
        return {
            constructor: {
                name: "OperatePhone",
            },
            selectElementFromList: sinon.spy(function() {
                selectElementFromListDifferedPromise = new Differed<void>();
                return selectElementFromListDifferedPromise.promise;
            }),
        };
    },
});

const searchResults = Target.called(".SearchResults");

describe("Unit Test: SelectFrom", function(): void {
    describe("Given a target", function(): void {
        describe("When the an actor select an item from a list", function(): void {
            let operatePhone: OperatePhone;
            let selectFromPromise: Promise<void>;

            const text = "Magic Beans";

            beforeEach(function(): void {
                operatePhone = OperatePhoneUsingMock(remote());
                selectFromPromise = SelectFrom.the(searchResults)
                    .itemContaining(text)
                    .performAs(Actor.named("Jack")
                        .whoCan(operatePhone));
            });

            it("Then OperatePhone.selectElementFromList function should be executed with the target and filtering" +
                " text", function(): void {
                expect(operatePhone.selectElementFromList).to.have.been.calledWith(searchResults, text);
            });

            describe("And the item is found", function(): void {
                beforeEach(function(): void {
                    selectElementFromListDifferedPromise.resolve();
                });

                it("Then the promise should resolve with undefined", async function(): Promise<void> {
                    await expect(selectFromPromise).to.eventually.be.undefined;
                });
            });

            describe("And the item is not found", function(): void {
                beforeEach(function(): void {
                    selectElementFromListDifferedPromise.reject();
                });

                it("Then the promise should be rejected with undefined", async function(): Promise<void> {
                    await expect(selectFromPromise).to.be.rejectedWith(undefined);
                });
            });
        });
    });
});
