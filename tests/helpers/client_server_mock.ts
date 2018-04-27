import {Differed} from './differed';
import {Element} from "webdriverio";

export let differed: DifferedPromises;

export class DifferedPromises {
    public touchElement: Differed<Element>;
    public setValue: Differed<void>;
    public elements = new Differed<Element[]>();
    public elementIdText: Differed<string>[];
    public elementIdClick = new Differed<Element[]>();
}

export class ClientMock {
    private elementIdTextCallCount = 0;

    constructor() {
        differed = new DifferedPromises();
        differed.elementIdText = [
            new Differed<string>(),
            new Differed<string>()
        ];
        differed.touchElement = new Differed<Element>();
        differed.setValue = new Differed<void>();
    }

    touch = sinon.spy(() => {
        return differed.touchElement.promise
    });

    setValue = sinon.spy(() => {
        return differed.setValue.promise
    });

    elements = sinon.spy(() => {
        return differed.elements.promise
    });

    elementIdText = sinon.spy(() => {
        let {promise} = differed.elementIdText[this.elementIdTextCallCount];
        this.elementIdTextCallCount = this.elementIdTextCallCount + 1;
        return promise;
    });

    elementIdClick = sinon.spy(() => {
        return differed.elementIdClick.promise
    });
}

export interface ElementsResponse {
    value: Array<Element>
}

export class ServerMock {
    private readonly error = new Error('This is a random error');

    private readonly elementIdTextResponses: Array<Object>;

    private readonly elementsResponse: ElementsResponse;

    respondTo(endpointCall: string) {
        let serverMock = this;
        return {
            withSuccess() : ElementsResponse {
                let propertyName = endpointCall + 'Response';
                differed[endpointCall].resolve(serverMock[propertyName]);
                return serverMock[propertyName]
            },
            withRejection() : Error {
                differed[endpointCall].reject(serverMock.error);
                return serverMock.error;
            },
        }
    }

    disconnect() {
        differed.elementIdText[0].resolve(this.elementIdTextResponses[0]);
        differed.elementIdText[1].reject(this.error);
        return this.error
    }

    connect() {
        this.elementIdTextResponses.forEach((responseMock, index) => {
            differed.elementIdText[index].resolve(responseMock)
        });

        const promises = differed.elementIdText.map(item => item.promise);

        return Promise.all(promises);
    }

    constructor(elementOfInterest = { id: 'UniqueElementId3', text: 'Mantle of Glory'}) {
        let elementsMock = [
            {
                ELEMENT: "UniqueElementId1",
            },
            {
                ELEMENT: elementOfInterest.id
            },
        ];

        this.elementIdTextResponses = [
            {
                value: "FLEECE OF GIDEON"
            },
            {
                value: elementOfInterest.text
            }
        ];

        this.elementsResponse = {
            value: elementsMock
        };
    }
}