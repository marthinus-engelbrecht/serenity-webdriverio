export interface Constructor<T> {
    new(...args): T;
}

export class Dido {
    static createMethodMock(methodName: Function, ResponseConstructor: Constructor<any>) {
        return new Proxy(methodName, {
            apply: function () {
                return new ResponseConstructor();
            }
        });
    }
}