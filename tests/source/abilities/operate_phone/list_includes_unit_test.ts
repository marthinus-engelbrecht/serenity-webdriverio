import {Client, remote} from "webdriverio";
import {Dido} from '../../../helpers/dido';
import {ClientMock} from '../../../helpers/phoneClientMock';
import {resolvePromises, setupMockData} from './helpers';
import {OperatePhone, Target} from '../../../../source/screenplay';

describe('When listIncludes is called with a target that is a list and an item', function () {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const expectedSelectedElement = {
        text: 'Magic Beans',
        id: "UniqueElementId2"
    };
    const theTarget = Target.called('.searchResults');
    let phoneClient: Client<any>;
    let operatePhonePromise;

    before(function () {
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).listIncludes(theTarget, expectedSelectedElement.text);
    });

    it('Then it should call phoneClient.element with the target selector', function () {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector)
    });

    describe('And phoneClient.element returns a fulfilled promise with an array', function () {
        let returnValue;

        const {elementsMock, elementIdTextResponseMockArray, responseMockElements} = setupMockData(expectedSelectedElement);

        beforeEach(async function () {
            resolvePromises(responseMockElements, elementIdTextResponseMockArray);
            returnValue = await operatePhonePromise;
        });

        it('Then it should call phoneClient.elementIdText for each element in the array', async function () {
            elementsMock.forEach(function (elementMock) {
                expect(phoneClient.elementIdText).to.have.been.calledWith(elementMock.ELEMENT)
            })
        });

        describe('And phoneClient.elementIdText is successfully called for each element in the element array', function () {

            it('Then listIncludes should return true', function () {
                expect(returnValue).to.be.true
            });
        });
    });
});
