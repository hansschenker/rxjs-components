# RxJS Components

A TypeScript and JSX example inspired by [yarr](https://github.com/bitspook/yarr).
Components return RxJS `Observable<Node>` streams. The page uses `combineLatest`
to compose the latest native DOM nodes from the counter and greeting components.

## Run locally

Use Node.js 22.12+ (22.x) or 24+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Run `npm run test:watch` for watch mode or `npm run preview` to serve the build.

Open `/samples/` on the Vite dev or preview server to try
[two independent counters composed with `combineLatest`](samples/counters.tsx).

## How it works

- TypeScript's classic JSX settings target the local `h` factory. Vite and Vitest
  use that same configuration. The factory creates real DOM nodes and composes
  observable children without a virtual DOM.
- [Counter, Greeting, and Page](src/page.tsx) seed the event streams with
  `startWith` so `combineLatest` can render before any interaction. Each
  subscription to `<Page />` builds its own nodes and connects its own event streams.
- [The JSX factory and mount function](src/dom.ts) preserve nodes in place when
  their positions stay the same, keeping focus through updates. Call the
  function returned by `mount` to unsubscribe and remove the mounted node.
- The `bindText` helper adapts the direct text binding from
  [rxjs-bindings](https://github.com/hansschenker/rxjs-bindings). It returns an
  observable text node that follows the mounted page's subscription.

## Contributors

OpenAI Codex implemented and tested the demo. See [CONTRIBUTORS.md](CONTRIBUTORS.md).
