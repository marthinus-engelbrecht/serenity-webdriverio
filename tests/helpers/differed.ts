export class Differed<T> {
    public constructor() {
        let resolve: (...args: any[]) => any;
        let reject: (...args: any[]) => any;

        this.promise = new Promise((innerResolve, innerReject) => {
            resolve = function(returnValueMock?: T): void {
                innerResolve(returnValueMock);
            };

            reject = function(rejectValueMock?: T): void {
                innerReject(rejectValueMock);
            };
        });

        this.resolve = resolve;
        this.reject = reject;
    }
    public resolve: (...args: any[]) => any;

    public reject: (...args: any[]) => any;

    public promise: PromiseLike<T>;
}