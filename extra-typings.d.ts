// I don't depend on the d3 typings because as of this writing they don't have the proper typings for all
// of these libraries and I'm not going to go rewrite them all now.
declare module 'd3-scale' {
  var scale: any;
  export = scale;
}

declare module 'react-is-deprecated' {
  import { Validator, Requireable, ValidationMap, ReactPropTypes } from 'react';

  export function deprecate<T>(validator: Validator<T>, message: string): Validator<T>;

  interface IsDeprecated<T> {
    isDeprecated: (message: string) => Validator<T>;
  }

  interface IsDeprecatedPropTypes {
    any: Requireable<any> & IsDeprecated<any>;
    array: Requireable<any> & IsDeprecated<any>;
    bool: Requireable<any> & IsDeprecated<any>;
    func: Requireable<any> & IsDeprecated<any>;
    number: Requireable<any> & IsDeprecated<any>;
    object: Requireable<any> & IsDeprecated<any>;
    string: Requireable<any> & IsDeprecated<any>;
    node: Requireable<any> & IsDeprecated<any>;
    element: Requireable<any> & IsDeprecated<any>;
    instanceOf(expectedClass: {}): Requireable<any> & IsDeprecated<any>;
    oneOf(types: any[]): Requireable<any> & IsDeprecated<any>;
    oneOfType(types: Validator<any>[]): Requireable<any> & IsDeprecated<any>;
    arrayOf(type: Validator<any>): Requireable<any> & IsDeprecated<any>;
    objectOf(type: Validator<any>): Requireable<any> & IsDeprecated<any>;
    shape(type: ValidationMap<any>): Requireable<any> & IsDeprecated<any>;
  }

  export function addIsDeprecated(propTypes: ReactPropTypes): IsDeprecatedPropTypes;
}
