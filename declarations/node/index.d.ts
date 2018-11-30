declare namespace NodeJS {
    import ExpectStatic = Chai.ExpectStatic;

    export interface Global {
        sinon: sinon.SinonStatic;
        expect: ExpectStatic;
    }
}
