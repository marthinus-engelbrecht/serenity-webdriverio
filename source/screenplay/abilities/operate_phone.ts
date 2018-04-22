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

    touch(target: Target): PromiseLike<void> {
        return new Promise(resolve => {
            this.phoneClient.touch(target.selector, false)
                .then(function () {
                    //ensure void return type
                    resolve()
                })
        })
    }

    enterValue(target: Target, value: string | number | Array<any>): PromiseLike<void> {
        return new Promise(resolve => [
            this.phoneClient.setValue(target.selector, value).then(() => resolve())
        ])
    }

    selectElementFromList(target: Target, text: string): PromiseLike<void> {
        return new Promise(async (resolve) => {
            const {value: partialElementArray} = await this.phoneClient.elements(target.selector);
            const elementsArray: any[] = await this.acquireElementsText(partialElementArray);
            const selectedElement = elementsArray.find(element => element.text === text);
            await this.phoneClient.elementIdClick(selectedElement.id);

            resolve()
        })
    }

    private async acquireElementsText(elementArray: any) : Promise<any[]>{
        let promises = [];

        elementArray.forEach((element) => {
            const promise = this.phoneClient.elementIdText(element.ELEMENT).then(item => {
                return {
                    text: item.value,
                    id: element.ELEMENT
                };
            });

            promises.push(promise)
        });

        return await Promise.all(promises);
    }
}