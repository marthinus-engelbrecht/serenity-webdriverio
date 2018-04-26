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