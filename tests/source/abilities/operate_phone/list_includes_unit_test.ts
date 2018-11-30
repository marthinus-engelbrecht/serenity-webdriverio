import {Client, remote} from "webdriverio";
import {OperatePhone, Target} from "../../../../source/screenplay";
import {ClientMock, ServerMock} from "../../../helpers/client_server_mock";
import {Dido} from "../../../helpers/dido";

describe("When listIncludes is called with a target that is a list and an item", function(): void {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const elementToBeFound = {
        id: "UniqueElementId2",
        text: "Magic Beans",
    };
    const theTarget = Target.called(".searchResults");
    let phoneClient: Client<any>;
    let serverMock: ServerMock;
    let operatePhonePromise: Promise<boolean>;

    beforeEach(function(): void {
        serverMock = new ServerMock(elementToBeFound);
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient).listIncludes(theTarget, elementToBeFound.text);
    });

    it("Then it should call phoneClient.element with the target selector", function(): void {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector);
    });

    describe("And phoneClient.element returns a fulfilled promise with an array", function(): void {
        let elementMockIds: string[];

        beforeEach(async function(): Promise<void> {
            const response = serverMock.respondTo<"elements">("elements").withSuccess();
            elementMockIds = response.value.map((element) => element.ELEMENT);
        });

        describe("And there is no connection issues", function(): void {
            beforeEach(async function(): Promise<void> {
                await serverMock.connect();
            });

            it("Then it should call phoneClient.elementIdText for each element in the array",
                async function(): Promise<void> {
                expect(phoneClient.elementIdText).to.be.calledWithEach(elementMockIds);
            });

            describe("And phoneClient.elementIdText is successfully called for each element in the element array",
                function(): void {

                it("Then listIncludes should return a resolved promise with the value true",
                    async function(): Promise<void> {

                    await expect(operatePhonePromise).to.eventually.be.true;
                });
            });
        });

        describe("And there are connection issues", function(): void {
            let connectionError: Error;

            beforeEach(function(): void {
                connectionError = serverMock.disconnect();
            });

            it("Then listIncludes should return a rejected promise with the error", async function(): Promise<void> {
                await expect(operatePhonePromise).to.be.rejectedWith(connectionError);
            });
        });

    });

    describe("And phoneClient.element returns a rejected promise with an error", function(): void {
        let error: Error;

        beforeEach(function(): void {
            error = serverMock.respondTo("elements").withRejection();
        });

        it("Then listIncludes should return with a rejected promise and the error", async function(): Promise<void> {
            await expect(operatePhonePromise).to.be.rejectedWith(error);
        });
    });
});
