export interface Constructor<T> {
    new(...args: any[]): T;
}

export class Dido {
    public static createMethodMock(methodName: (...args: any[]) => any, ResponseConstructor: Constructor<any>): any {
        return new Proxy(methodName, {
            apply(): any {
                return new ResponseConstructor();
            },
        });
    }
}
