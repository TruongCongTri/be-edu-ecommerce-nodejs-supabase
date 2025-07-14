export function applyDecorators(target: any, propertyKey: string | symbol, decorators: Array<PropertyDecorator>) {
  decorators.forEach((decorator) => {
    decorator(target, propertyKey);
  });
}
