import {expect, use} from 'chai';
import chaiAsPromised = require('chai-as-promised');
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(chaiAsPromised);
use(sinonChai);

export class Model {
    name: string;
    shape: string;
}

use(function (chai, utils) {
    let Assertion = chai.Assertion;

    Assertion.addMethod('calledWithEach', function (array) {
        array.forEach((item) => {
            new Assertion(this._obj).to.be.calledWith(item);
        });
    })
});

(<any>global).expect = expect;
(<any>global).sinon = sinon;
