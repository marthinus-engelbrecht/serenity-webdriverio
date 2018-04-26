import {Target} from '../../../../source/screenplay';

describe('Unit Test: Target', function () {
    describe('Given a selector text', function () {
        let selectorText;

        beforeEach(function () {
            selectorText = '#doStuff'
        });

        describe('when the called function is executed with the selector', function () {
            let result: Target;

            beforeEach(function () {
                result = Target.called(selectorText)
            });

            it('it should return an object that has the selector as a property', function () {
                expect(result.selector).to.equal(selectorText);
            });
        });
    }); 
});