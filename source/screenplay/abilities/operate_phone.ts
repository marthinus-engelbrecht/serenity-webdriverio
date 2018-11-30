import {Ability, UsesAbilities} from "@serenity-js/core/lib/screenplay";
import {Client} from "webdriverio";
import {Target} from "../ui";

export class OperatePhone implements Ability {
    public static using(phoneClient: Client<any>): OperatePhone {
        return new OperatePhone(phoneClient);
    }

    public static as(actor: UsesAbilities): OperatePhone {
        return actor.abilityTo(OperatePhone);
    }

    constructor(private phoneClient: Client<any>) {
    }

    public touch(target: Target): Promise<void> {
        return new Promise((resolve, reject) => {
            this.phoneClient.touch(target.selector, false)
                .then(function(): void {
                    // ensure void return type
                    resolve();
                })
                .catch(reject);
        });
    }

    public enterValue(target: Target, value: string | number | any[]): PromiseLike<void> {
        return new Promise((resolve, reject) => [
            this.phoneClient.setValue(target.selector, value)
                .then(() => resolve())
                .catch(reject),
        ]);
    }

    public selectElementFromList(target: Target, text: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const elementsIdArray = await this.getElementIds(target);
                const elementsTextArray = await this.getElementsText(elementsIdArray);
                const elementsArray = elementsIdArray.map((id, index) => {
                    return {
                        id,
                        text: elementsTextArray[index],
                    };
                });

                const selectedElement = elementsArray.find((element) => element.text === text);
                await this.phoneClient.elementIdClick(selectedElement.id);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public async listIncludes(target: Target, item: string): Promise<boolean> {
        const elementsIdArray = await this.getElementIds(target);
        const elementTextArray = await this.getElementsText(elementsIdArray);
        return elementTextArray.includes(item);
    }

    private async getElementIds(target: Target): Promise<string[]> {
        const rawResults = await this.phoneClient.elements(target.selector);
        const rawElementsArray = rawResults.value;
        return rawElementsArray.map((item) => item.ELEMENT);
    }

    private async getElementsText(elementsIdArray: string[]): Promise<string[]> {
        const promises: Array<Promise<string>> = [];

        elementsIdArray.forEach((elementId) => {
            const promise = this.phoneClient.elementIdText(elementId).then((item) => item.value);
            promises.push(promise as any as Promise<string>);
        });

        return await Promise.all(promises);
    }
}