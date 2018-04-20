import {Ability, Actor, UsesAbilities} from "@serenity-js/core/lib/screenplay";
import Client = WebdriverIO.Client;
import {Target} from '../ui';

export class OperatePhone implements Ability {
    static using(phoneClient: Client<any>): OperatePhone {
        return new OperatePhone(phoneClient);
    }

    static as(actor: UsesAbilities): OperatePhone {
        return actor.abilityTo(OperatePhone);
    }

    constructor(private phoneClient: Client<any>) {}

    touch(target: Target): PromiseLike<void> {
        return new Promise(resolve => {
            this.phoneClient.touch(target.selector, false)
                .then(function () {
                    //ensure void return type
                    resolve()
                })
        })
    }
}