import { callsOf, mock, spy } from "testtriple";
import { constructable, container, resolve } from "./index.js";

describe("constructable", () => {
  it("can be constructed", () => {
    const dep1 = 1;
    const dep2 = "dep2";
    const app = constructable({ dep1, dep2 }, (deps) => deps);

    expect(app.construct({ dep1: 2, dep2: "dep" })).toStrictEqual({
      dep1: 2,
      dep2: "dep",
    });
  });
});

describe("resolve", () => {
  it("resolves with default container", () => {
    console.log = spy();
    const { app } = setup();
    resolve(app).run();

    expect(callsOf(console.log)).toStrictEqual([[-4]]);
  });

  it("resolves with test container", () => {
    const { app, logger, add } = setup();
    const deps = container()
      .set(add, () => 10)
      .set(logger, mock({ log: spy() }));
    resolve(app, deps).run();
    expect(callsOf(deps.get(logger)?.log)).toStrictEqual([[3]]);
  });

  it("resolves always to the same", () => {
    console.log = spy();
    const { app } = setup();
    expect(resolve(app)).toBe(resolve(app));
  });

  const setup = () => {
    const add = constructable({}, () => (a: number, b: number) => a + b);
    const sub = constructable({}, () => (a: number, b: number) => a - b);
    const calculator = constructable({ add, sub }, ({ add, sub }) => ({
      add,
      sub,
    }));
    const logger = constructable({ console }, ({ console }) => {
      return {
        log: (value: any) => console.log(value),
      };
    });

    const app = constructable(
      { calculator, logger },
      ({ calculator, logger }) => {
        return {
          run: () => {
            logger.log(calculator.sub(calculator.add(1, 2), 7));
          },
        };
      }
    );

    return { calculator, add, sub, logger, app };
  };
});
