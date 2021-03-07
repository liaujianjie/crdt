import type { CrdtPayload, CvrdtSpecification } from "../typings";

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

type ChainedUtilsAndPayload<Payload extends CrdtPayload<unknown>, Utils extends CvrdtSpecification<Payload>> = {
  unchain(): Payload;
} & {
  [chainedMethodName in keyof Utils]: (...args: DropFirst<Parameters<Extract<Utils[keyof Utils], (...args: any[]) => any>>>) => ChainedUtilsAndPayload<Payload, Utils>
};


export function chain<Payload extends CrdtPayload<unknown>, Utils extends CvrdtSpecification<Payload>>(payload: Payload, utils: Utils): ChainedUtilsAndPayload<Payload, Utils> {
  const methodNames = Object.keys(utils) as (keyof Utils)[];
  return methodNames.reduce((prevChain, methodName) => {
    type ParametersWithoutPayload = DropFirst<Parameters<Extract<Utils[keyof Utils], (...args: any[]) => any>>>;
    const method = utils[methodName];
    if (typeof method !== "function") {
      return prevChain;
    }
    return {
      ...prevChain,
      unchain() { return  payload},
      [methodName](...args: ParametersWithoutPayload) { return chain(method(payload, ...args), utils) }
    }
  }, {} as ChainedUtilsAndPayload<Payload, Utils>);
}