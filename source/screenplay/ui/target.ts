export class Target {
    static called(selector: string) : Target {
        return new Target(selector);
    }

    constructor(public selector: string) {
    }
}