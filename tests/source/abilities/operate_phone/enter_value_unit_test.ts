import {Client, remote} from "webdriverio";
import {OperatePhone, Target} from "../../../../source/screenplay";
import {ClientMock, ServerMock} from "../../../helpers/client_server_mock";
import {Dido} from "../../../helpers/dido";

describe("When enterValue is called with a target and a value", function(): void {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const theTarget = Target.called("#textField");
    const theValue = 45;
    let serverMock: ServerMock;
    let phoneClient: Client<any>;
    let operatePhonePromise: Promise<void>;

    beforeEach(function(): void {
        serverMock = new ServerMock();
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).enterValue(theTarget, theValue) as Promise<void>;
    });

    it("it should call phoneClient.setValue with the target selector", function(): void {
        expect(phoneClient.setValue).to.have.been.calledWith(theTarget.selector, theValue);
    });

    describe("And the value was set successfully", function(): void {
        beforeEach(function(): void {
            serverMock.respondTo("setValue").withSuccess();
        });

        it("Then it should return a fulfilled promise", async function(): Promise<void> {
            await expect(operatePhonePromise).to.eventually.equal(undefined);
        });
    });

    describe("And it failed to set the value", function(): void {
        let error: Error;

        beforeEach(function(): void {
            error = serverMock.respondTo("setValue").withRejection();
        });

        it("Then it should return a rejected promise with the error", async function(): Promise<void> {
            await expect(operatePhonePromise).to.be.rejectedWith(error);
        });
    });
});
