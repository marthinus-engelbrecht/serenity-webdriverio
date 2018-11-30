import {Client, remote} from "webdriverio";
import {OperatePhone, Target} from "../../../../source/screenplay";
import {ClientMock, ServerMock} from "../../../helpers/client_server_mock";
import {Dido} from "../../../helpers/dido";
import {ignoreExpectedUnhandledRejection} from "./helpers";

describe("When selectElementFromList is called with a targets selector", function(): void {
    const remoteMock = Dido.createMethodMock(remote, ClientMock);
    const elementToBeSelected = {
        id: "UniqueElementId2",
        text: "Magic Beans",
    };
    const theTarget = Target.called(".searchResults");
    let phoneClient: Client<any>;
    let serverMock: ServerMock;
    let operatePhonePromise: Promise<void>;

    beforeEach(function(): void {
        serverMock = new ServerMock(elementToBeSelected);
        phoneClient = remoteMock();
        operatePhonePromise = OperatePhone.using(phoneClient)
            .selectElementFromList(theTarget, elementToBeSelected.text);
    });

    it("Then it should call phoneClient.element with the target selector", function(): void {
        expect(phoneClient.elements).to.have.been.calledWith(theTarget.selector);
    });

    describe("And phoneClient.element returns a fulfilled promise with an array", function(): void {
        let elementMockIds: string[];

        beforeEach(function(): void {
            const response = serverMock.respondTo<"elements">("elements").withSuccess();
            elementMockIds = response.value.map((element) => element.ELEMENT);
        });

        describe("And there is no connection issues", function(): void {
            beforeEach(async function(): Promise<void> {
                await serverMock.connect();
            });

            it("Then it should call phoneClient.elementIdText for each element in the array", function(): void {
                expect(phoneClient.elementIdText).to.be.calledWithEach(elementMockIds);
            });

            describe("And phoneClient.elementIdText is successfully called for each element in the element array",
                function(): void {

                    it("Then phoneClient.touchId should be called with the selected element\"s id", function(): void {
                        expect(phoneClient.elementIdClick).to.have.been.calledWith(elementToBeSelected.id);
                    });

                    describe("And phoneClient.elementIdClick was successful", function(): void {
                        beforeEach(function(): void {
                            serverMock.respondTo("elementIdClick").withSuccess();
                        });

                        it("Then selectElementFromList should return a resolved promise with the value undefined",
                            async function(): Promise<void> {

                                await expect(operatePhonePromise).to.eventually.equal(undefined);
                            });
                    });

                    describe("And phoneClient.elementIdClick was a failure", function(): void {
                        let error: Error;

                        beforeEach(function(): void {
                            error = serverMock.respondTo("elementIdClick").withRejection();
                        });

                        it("Then selectElementFromList should return with a rejected promise",
                            async function(): Promise<void> {
                                await expect(operatePhonePromise).to.be.rejectedWith(error);
                            });
                    });
                });
        });

        describe("And there are connection issues", function(): void {
            let connectionError: Error;

            beforeEach(function(): void {
                connectionError = serverMock.disconnect();
            });

            it("Then selectElementFromList should return a rejected promise with the error",
                async function(): Promise<void> {

                    await expect(operatePhonePromise).to.be.rejectedWith(connectionError);
                });

            it("Then phoneClient.touchId should never be called", async function(): Promise<void> {
                await ignoreExpectedUnhandledRejection(operatePhonePromise, connectionError);
                expect(phoneClient.elementIdClick).to.have.not.been.called;
            });
        });
    });

    describe("And phoneClient.element returns a rejected promise with an error", function(): void {
        let error: Error;

        beforeEach(function(): void {
            error = serverMock.respondTo("elements").withRejection();
        });

        it("Then selectElementFromList should return with a rejected promise and the error",
            async function(): Promise<void> {
                await expect(operatePhonePromise).to.be.rejectedWith(error);
            });
    });
});
