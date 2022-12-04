# constructable

`constructable` is a very lightweight library to make your code easily testable.
It is an alternative for mocking node modules or traditional dependency injection frameworks.

## Before

```ts
// index.ts
import {app} from "./app"

app.run()

// app.ts
import {logger} from "./logger"

export const app = {
    run: ()=>{
        logger.log("app started")
    }
}

// logger.ts
export const logger = {
    log: (values: ...any[])=>console.log(...values)
}
```

### unit tests

The only way to unit-test `app` is to mock the logger module for example with jest.mock

```ts
// app.spec.ts
import { app } from "./app";
import { logger } from "./logger";

jest.mock("./logger");

it("logs", () => {
  app.run();
  expect(app).toHaveBeenCalledWith("app started");
});
```

### integration tests

Integration tests are exactly the same as unit tests and can only be achieved by module mocking

## Problems

- Mocking a node module like jest.mock is a LOT of magic and basically a hack
- Mocking node modules will become even hackier with esnext modules
- By default, ALL exports in a file are mocked, unless specified otherwise. When moving code between files, this can cause unexpected behavior.
- Moving code between files also requires updating the `jest.mock(...)` calls, which is easily forgotten.
- The typechecker can't detect, if you're trying to mock a module, for which `jest.mock(...)` was not called. You'll only notice this after running the tests.
- In unit-tests you usually only want to test your unit, mocking away everything else. But the type system cannot detect if you're really mocking away everything. If you're adding dependencies to your unit, you'll have to remember mocking these away in your tests or it would call the real code.

## Solution

```ts
// index.ts
import {resolve} from "constructable"
import {app} from "./app"

resolve(app).run()


// app.ts
import {logger} from "./logger"

export const app = constructable({logger},({logger})=>({
    run: ()=>{
        logger.log("app started")
    }
}))

// logger.ts
export const logger = constructable({console},({console})=>({
    log: (values: ...any[])=>console.log(...values)
}))
```

### unit tests

```ts
// app.spec.ts
import { app } from "./app";

it("logs", () => {
  const logger = { log: jest.mock() };
  app.construct({ logger }).run(); //construct does not typecheck, if not all dependencies get passed
  expect(logger.log).toHaveBeenCalledWith("app started");
});
```

### integration tests

```ts
// app.spec.ts
import {import,resolve,container} from "constructable"
import { app } from "./app";
import { logger } from "./logger";

it("logs", () => {
  const loggerMock = {log: jest.mock()}
  resolve(app,container().set(logger,loggerMock)).run()
  expect(logger.log).toHaveBeenCalledWith("app started");
});
```

## Why not use a classic dependency injection framework

Classic dependency injection frameworks usually require you to think a bit different when bootstrapping your app, than you usually would. This means defining your components in one place, and then wire the whole thing together in a different place (the container). This has the benefit of completely decoupling your components from each other.

With `constructable` your thinking or project structure won't change much. You just wrap your code everywhere and that's basically it. Your code won't be as decoupled as with classic dependency injection, but testing it is very easy.

## License

MIT
