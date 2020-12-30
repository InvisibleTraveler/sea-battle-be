export function dataProvider(func: any, data: any) {
    return (eventData: any) => func(data, eventData);
}
