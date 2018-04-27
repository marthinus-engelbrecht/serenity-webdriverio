export function handleExpectedError(error, connectionError: string) {
    if (error !== connectionError) {
        throw error
    }
}

export async function ignoreExpectedUnhandledRejection(operatePhonePromise, expectedError) {
    await operatePhonePromise
        .catch(error => handleExpectedError(error, expectedError));
}