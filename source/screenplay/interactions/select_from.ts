import {AnswersQuestions, Interaction, UsesAbilities} from "@serenity-js/core/lib/screenplay";
import {OperatePhone} from "../abilities";
import {Target} from "../ui";

export class SelectFrom implements Interaction {
    public static the(target: Target): SelectFrom {
        return new SelectFrom(target);
    }

    public constructor(readonly target: Target) {

    }

    public itemContaining(text: string): SelectFrom {
        this.text = text;
        return this;
    }

    public performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return OperatePhone.as(actor).selectElementFromList(this.target, this.text);
    }

    private text: string;
}