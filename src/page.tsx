import { combineLatest, defer, fromEvent, map, scan, startWith } from 'rxjs';
import { bindText, h, type View } from './dom';

export function Counter({ initial = 0 }: { initial?: number }): View {
  return defer(() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Add one';
    const count$ = fromEvent(button, 'click').pipe(
      scan(total => total + 1, initial),
      startWith(initial),
    );

    return (
      <section>
        <h2>Counter</h2>
        <p>Count: <output aria-live="polite">{bindText(count$)}</output></p>
        {button}
      </section>
    );
  });
}

export function Greeting(): View {
  return defer(() => {
    const input = document.createElement('input');
    input.type = 'text';
    const greeting$ = fromEvent(input, 'input').pipe(
      map(() => input.value.trim()),
      startWith(''),
      map(name => name ? `Hello, ${name}!` : 'Hello, reader!'),
    );

    return (
      <section>
        <h2>Greeting</h2>
        <label>Your name {input}</label>
        <p aria-live="polite">{bindText(greeting$)}</p>
      </section>
    );
  });
}

export function Page(): View {
  const components$ = combineLatest([<Counter />, <Greeting />]);
  return (
    <main>
      <h1>RxJS Components</h1>
      {components$}
    </main>
  );
}
