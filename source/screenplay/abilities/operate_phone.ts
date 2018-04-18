import {Ability} from "@serenity-js/core/lib/screenplay";
import Client = WebdriverIO.Client;
import {Target} from '../ui';

export class OperatePhone implements Ability{
    static using(phoneClient: Client<any>): OperatePhone{
        return new OperatePhone(phoneClient);
    }

    constructor(private phoneClient: Client<any>) {

    }

    touch(target : Target) : OperatePhone {
        this.phoneClient.touch('#doStuff', false );
        return this
    }
}