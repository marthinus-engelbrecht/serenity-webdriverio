import {Interaction, UsesAbilities} from "@serenity-js/core/lib/screenplay";
import {OperatePhone} from "../abilities";
import {Target} from "../ui";

export class Touch implements Interaction {
    public static the(target: Target): Touch {
        return new Touch(target);
    }

    public constructor(private target: Target) {
    }

    public performAs(actor: UsesAbilities): PromiseLike<void> {
        return OperatePhone.as(actor).touch(this.target);
    }
}