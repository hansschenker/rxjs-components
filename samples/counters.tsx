import { combineLatest, defer, fromEvent, scan, startWith } from 'rxjs';
import { bindText, h, mount, type View } from '../src/dom';
import '../src/style.css';

function Counter({ label }: { label: string }): View {
  return defer(() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Add one';

    const count$ = fromEvent(button, 'click').pipe(
      scan(count => count + 1, 0),
      startWith(0),
    );

    return (
      <section>
        <h2>{label}</h2>
        {button}
        <p>Count: <output aria-live="polite">{bindText(count$)}</output></p>
      </section>
    );
  });
}

function Page(): View {
  const counters$ = combineLatest([
    <Counter label="First counter" />,
    <Counter label="Second counter" />,
  ]);

  return <main><h1>Two RxJS Counters</h1>{counters$}</main>;
}

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app mount point');

const unmount = mount(root, <Page />);
if (import.meta.hot) import.meta.hot.dispose(unmount);
