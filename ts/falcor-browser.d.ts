declare module "falcor-browser" {
  function get(pathSet: any): any;
  function set(jsongEnv): any;
  function call(callPath: any, args?: any, pathSuffix?: any, paths?: any): any;

  interface IXMLHttpSource {
    get(pathSet: any): any;
    set(jsongEnv): any;
    call(callPath: any, args?: any, pathSuffix?: any, paths?: any): any;
  }
  export class XMLHttpSource implements IXMLHttpSource {
    constructor(...args);
    get(pathSet: any): any;
    set(jsongEnv): any;
    call(callPath: any, args?: any, pathSuffix?: any, paths?: any): any;
  }
  export default XMLHttpSource
}
