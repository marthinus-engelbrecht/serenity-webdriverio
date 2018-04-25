import {Ability, Actor, UsesAbilities} from "@serenity-js/core/lib/screenplay";
import {Client, Element} from 'webdriverio';
import {Target} from '../ui';

export class OperatePhone implements Ability {
    static using(phoneClient: Client<any>): OperatePhone {
        return new OperatePhone(phoneClient);
    }

    static as(actor: UsesAbilities): OperatePhone {
        return actor.abilityTo(OperatePhone);
    }

    constructor(private phoneClient: Client<any>) {
    }

    touch(target: Target): Promise<void> {
        return new Promise((resolve, reject) => {
            this.phoneClient.touch(target.selector, false)
                .then(function () {
                    //ensure void return type
                    resolve()
                })
                .catch(reject)
        })
    }

    enterValue(target: Target, value: string | number | Array<any>): PromiseLike<void> {
        return new Promise((resolve, reject) => [
            this.phoneClient.setValue(target.selector, value)
                .then(() => resolve())
                .catch(reject)
        ])
    }

    selectElementFromList(target: Target, text: string): Promise<void> {
        return new Promise(async (resolve) => {
            const elementsIdArray = await this.getElementIds(target);
            const elementsTextArray = await this.getElementsText(elementsIdArray);
            const elementsArray = elementsIdArray.map((id, index) => {
                return {
                    id: id,
                    text: elementsTextArray[index]
                }
            });

            const selectedElement = elementsArray.find(element => element.text === text);
            await this.phoneClient.elementIdClick(selectedElement.id);

            resolve()
        })
    }

    private async getElementIds(target: Target) {
        const rawResults = await this.phoneClient.elements(target.selector);
        const rawElementsArray = rawResults.value;
        return rawElementsArray.map(item => item.ELEMENT);
    }

    async listIncludes(target: Target, item: string) : Promise<boolean> {
        const elementsIdArray = await this.getElementIds(target);
        const elementTextArray = await this.getElementsText(elementsIdArray);
        return elementTextArray.includes(item);
    }

    private async getElementsText(elementsIdArray: string[]) : Promise<string[]>{
        let promises = [];

        elementsIdArray.forEach((elementId) => {
            const promise = this.phoneClient.elementIdText(elementId).then(item => item.value);
            promises.push(promise)
        });

        return await Promise.all(promises);
    }
}