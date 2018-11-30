declare let expect: Chai.ExpectStatic;
declare let sinon: any;

declare namespace Chai {
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        calledWithEach(array: any[]): Assertion;
    }
}