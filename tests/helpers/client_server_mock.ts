import {Element} from "webdriverio";
import {Differed} from "./differed";

export let differed: DifferedPromises;

export class DifferedPromises {
    public touchElement: Differed<Element>;
    public setValue: Differed<void>;
    public elements = new Differed<Element[]>();
    public elementIdText: Array<Differed<string>>;
    public elementIdClick = new Differed<Element[]>();
}

export class ClientMock {
    public constructor() {
        differed = new DifferedPromises();
        differed.elementIdText = [
            new Differed<string>(),
            new Differed<string>(),
        ];
        differed.touchElement = new Differed<Element>();
        differed.setValue = new Differed<void>();
    }

    private elementIdTextCallCount = 0;

    public touch = sinon.spy(() => {
        return differed.touchElement.promise;
    });

    public setValue = sinon.spy(() => {
        return differed.setValue.promise;
    });

    public elements = sinon.spy(() => {
        return differed.elements.promise;
    });

    public elementIdText = sinon.spy(() => {
        const {promise} = differed.elementIdText[this.elementIdTextCallCount];
        this.elementIdTextCallCount = this.elementIdTextCallCount + 1;
        return promise;
    });

    public elementIdClick = sinon.spy(() => {
        return differed.elementIdClick.promise;
    });
}

export interface ElementsResponse {
    value: Element[];
}

export interface ElementIdTextResponse {
    value: string;
}

export class ServerMock {

    public constructor(elementOfInterest = {id: "UniqueElementId3", text: "Mantle of Glory"}) {
        const elementsMock = [
            {
                ELEMENT: "UniqueElementId1",
            },
            {
                ELEMENT: elementOfInterest.id,
            },
        ];

        const elementIdText = [
            {
                value: "FLEECE OF GIDEON",
            },
            {
                value: elementOfInterest.text,
            },
        ];

        const elements = {
            value: elementsMock,
        };

        this.mockResponses = new ServerMockResponses(elementIdText, elements);
    }

    public respondTo<T extends keyof ServerMockResponses>(endpointCall: Extract<keyof DifferedPromises, T>,
                                                          callNumber: number = 1): Respond<T> {
        const serverMock = this;
        return {
            withSuccess(): ServerMockResponseKeys[T] {
                const promiseOrPromises = differed[endpointCall];
                if (endpointCall === "elementIdText") {
                    const response = serverMock.mockResponses.elementIdText[callNumber];
                    (promiseOrPromises as DifferedPromises["elementIdText"])[callNumber].resolve(response);
                    return response;
                } else {
                    const response = serverMock.mockResponses[endpointCall as keyof ServerMockResponses];
                    (promiseOrPromises as DifferedPromises[Exclude<keyof DifferedPromises, "elementIdText">])
                        .resolve(response);
                    return response;
                }
            },
            withRejection(): Error {
                const promiseOrPromises = differed[endpointCall];

                if (promiseOrPromises instanceof Array) {
                    promiseOrPromises[callNumber].resolve(serverMock.error);
                } else {
                    (promiseOrPromises as DifferedPromises[Exclude<keyof DifferedPromises, "elementIdText">])
                        .reject(serverMock.error);
                }
                return serverMock.error;
            },
        };
    }

    public disconnect(): Error {
        differed.elementIdText[0].resolve(this.mockResponses.elementIdText[0]);
        differed.elementIdText[1].reject(this.error);
        return this.error;
    }

    public connect(): Promise<string[]> {
        this.mockResponses.elementIdText.forEach((responseMock, index) => {
            differed.elementIdText[index].resolve(responseMock);
        });

        const promises = differed.elementIdText.map((item) => item.promise);

        return Promise.all(promises);
    }

    private readonly error = new Error("This is a random error");

    private readonly mockResponses: ServerMockResponses;
}

export class ServerMockResponses implements ServerMockResponseKeys {
    constructor(public readonly elementIdText?: ElementIdTextResponse[],
                public elements?: ElementsResponse,
                public setValue?: void,
                public elementIdClick?: Element[],
                public touchElement?: Element[],
    ) {

    }
}

export type ServerMockResponseKeys = {
    [P in keyof DifferedPromises]?: any
};

export interface Respond<T extends keyof ServerMockResponses> {
    withSuccess: () => ServerMockResponses[T];
    withRejection: () => Error;
}
