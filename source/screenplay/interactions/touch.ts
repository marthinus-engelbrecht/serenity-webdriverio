import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {Target} from '../ui';
import {OperatePhone} from '../abilities';

export class Touch implements Interaction{
    static the(target: Target) {
        return new Touch(target);
    }

    constructor(private target){
    }

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return OperatePhone.as(actor).touch(this.target);
    }
}