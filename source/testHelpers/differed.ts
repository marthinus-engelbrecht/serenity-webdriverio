export class Differed<T> {
    public resolve: Function;
    public reject: Function;

    public promise: PromiseLike<T>;

    constructor() {
        let resolve: Function;
        let reject: Function;

        this.promise = new Promise((innerResolve, innerReject) => {
            resolve = function (returnValueMock?: T) {
                innerResolve(returnValueMock || undefined);
            };

            reject = function () {
                innerReject();
            }
        });

        this.resolve = resolve;
        this.reject = reject;
    }
}