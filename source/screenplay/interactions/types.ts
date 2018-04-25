import {AnswersQuestions, Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {Target} from '../ui';
import {OperatePhone} from '../abilities';

export class Types implements Interaction{
    private target: Target
    static theValue(value: string | number | Array<any>) : Types {
        return new Types(value);
    }

    constructor(private value: string | number | Array<any>) {

    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return OperatePhone.as(actor).enterValue(this.target, this.value);
    }

    into(target: Target) : Types {
        this.target = target;
        return this;
    }
}