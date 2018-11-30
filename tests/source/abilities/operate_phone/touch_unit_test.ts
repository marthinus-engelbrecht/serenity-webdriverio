import {Client, remote} from "webdriverio";
import {OperatePhone, Target} from "../../../../source/screenplay";
import {ClientMock, ServerMock} from "../../../helpers/client_server_mock";
import {Dido} from "../../../helpers/dido";

describe("When touch is called with a target", function(): void {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    let phoneClient: Client<any>;
    let touchResponsePromise: Promise<void>;
    let serverMock: ServerMock;
    const theTarget = Target.called("#doStuff");

    beforeEach(function(): void {
        serverMock = new ServerMock();
        phoneClient = remoteMock();
        touchResponsePromise = OperatePhone.using(phoneClient).touch(theTarget);
    });

    it("it should call phoneClient.touch with the targets selector", function(): void {
        expect(phoneClient.touch).to.have.been.calledWith(theTarget.selector);
    });

    describe("And the target is successfully touched", function() {
        beforeEach(function(): void {
            serverMock.respondTo("touchElement").withSuccess();
        });

        it("Then phoneClient.touch should resolve with undefined", async function(): Promise<void> {
            await expect(touchResponsePromise).to.eventually.equal(undefined);
        });
    });

    describe("And the target cannot be found", function(): void {
        let error: Error;

        beforeEach(function(): void {
            error = serverMock.respondTo("touchElement").withRejection();
        });

        it("Then phoneClient.touch should resolve with undefined", async function(): Promise<void> {
            await expect(touchResponsePromise).to.rejectedWith(error);
        });
    });
});
