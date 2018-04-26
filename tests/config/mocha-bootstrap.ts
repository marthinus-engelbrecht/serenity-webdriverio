import {expect, use} from 'chai';
import chaiAsPromised = require('chai-as-promised');
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(chaiAsPromised);
use(sinonChai);

(<any>global).expect = expect;
(<any>global).sinon = sinon;
