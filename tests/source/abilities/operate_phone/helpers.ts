import {differed, DifferedPromises} from '../../../helpers/phoneClientMock';

export function handleExpectedError(error, connectionError: string) {
    if (error !== connectionError) {
        throw error
    }
}

export function simulateConnectionFailure(differed: DifferedPromises, elementIdTextResponseMockArray, connectionError: string) {
    differed.elementIdText[0].resolve(elementIdTextResponseMockArray[0]);
    differed.elementIdText[1].reject(connectionError);
}

export async function ignoreExpectedUnhandledRejection(operatePhonePromise, expectedError) {
    await operatePhonePromise
        .catch(error => handleExpectedError(error, expectedError));
}

export function resolvePromises(responseMockElements, elementIdTextResponseMockArray) {
    differed.elements.resolve(responseMockElements);
    elementIdTextResponseMockArray.forEach((elementIdTextResponseMock, index) => {
        differed.elementIdText[index].resolve(elementIdTextResponseMock)
    });
    differed.elementIdClick.resolve();
}

export function setupMockData(expectedSelectedElement) {
    const elementsMock = [
        {
            ELEMENT: "UniqueElementId1",
        },
        {
            ELEMENT: expectedSelectedElement.id
        },
    ];

    const elementIdTextResponseMockArray = [
        {
            value: "FLEECE OF GIDEON"
        },
        {
            value: expectedSelectedElement.text
        }
    ];

    const responseMockElements = {
        value: elementsMock
    };
    return {elementsMock, elementIdTextResponseMockArray, responseMockElements};
}