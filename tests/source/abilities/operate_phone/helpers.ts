export function handleExpectedError(error: Error, connectionError: Error): void {
    if (error.message !== connectionError.message) {
        throw error;
    }
}

export async function ignoreExpectedUnhandledRejection(operatePhonePromise: Promise<void>,
                                                       expectedError: Error): Promise<void> {
    await operatePhonePromise
        .catch((error) => handleExpectedError(error, expectedError));
}
