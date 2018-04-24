import {Target} from '../ui';
import {Question, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {OperatePhone} from '../abilities';

export class List implements Question<PromiseLike<boolean> > {
    private item: string;

    static of(target: Target) {
        return new List(target);
    }

    constructor(readonly target: Target)  {

    }

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return OperatePhone.as(actor).listIncludes(this.target, this.item);
    }

    includes(item : string) : Question<PromiseLike<boolean> > {
        this.item = item;
        return this;
    }
}