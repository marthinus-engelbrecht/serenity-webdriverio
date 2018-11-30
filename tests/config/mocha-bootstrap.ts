import {expect, use} from "chai";
import chaiAsPromised = require("chai-as-promised");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(chaiAsPromised);
use(sinonChai);

export class Model {
    public name: string;
    public shape: string;
}

use(function(chai, utils): void {
    const Assertion = chai.Assertion;

    Assertion.addMethod("calledWithEach", function(array: any[]): void {
        array.forEach((item) => {
            new Assertion(this._obj).to.be.calledWith(item);
        });
    });
});

global.expect = expect;
global.sinon = sinon;
