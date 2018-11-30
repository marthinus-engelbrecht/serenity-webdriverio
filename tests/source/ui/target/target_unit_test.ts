import {Target} from "../../../../source/screenplay";

describe("Unit Test: Target", function() {
    describe("Given a selector text", function() {
        let selectorText :string;

        beforeEach(function(): void {
            selectorText = "#doStuff";
        });

        describe("when the called function is executed with the selector", function(): void {
            let result: Target;

            beforeEach(function(): void {
                result = Target.called(selectorText);
            });

            it("it should return an object that has the selector as a property", function(): void {
                expect(result.selector).to.equal(selectorText);
            });
        });
    });
});