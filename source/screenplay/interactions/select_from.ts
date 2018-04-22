import {AnswersQuestions, Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {Target} from '../ui';
import {OperatePhone} from '../abilities';

export class SelectFrom implements Interaction {
    private text;

    static the(target: Target) {
        return new SelectFrom(target);
    }

    constructor(readonly target: Target) {

    }

    itemContaining(text : string) : SelectFrom {
        this.text = text;
        return this;
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return OperatePhone.as(actor).selectElementFromList(this.target, this.text);
    }
}