import { IsOptional } from 'class-validator';

type PropertyType = 'string' | 'number'; // Add more types as needed
export type FilterProperties = Record<string, PropertyType>;

export function createGenericFilterDto(properties: FilterProperties) {
  class GenericFilterDto {}

  Object.keys(properties).forEach((key) => {
    //const type = properties[key];
    const decorator = getDecorator();

    // Apply the decorator function to the property
    decorator()(GenericFilterDto.prototype, key);
  });

  return GenericFilterDto;
}

function getDecorator() {
  // This returns the actual decorator function
  return IsOptional;
}
