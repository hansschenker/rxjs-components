import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { h, mount } from './dom';
import { Page } from './page';

afterEach(() => document.body.replaceChildren());

describe('observable JSX', () => {
  it('waits for both children and updates their DOM positions', () => {
    const root = document.createElement('div');
    const first$ = new Subject<Node>();
    const second$ = new Subject<Node>();
    const second = document.createElement('input');
    const unmount = mount(root, <main>{first$}{second$}</main>);
    try {
      first$.next(document.createTextNode('first'));
      expect(root.firstChild).toBeNull();
      second$.next(second);
      const main = root.firstChild!;
      expect(main.textContent).toBe('first');

      first$.next(document.createTextNode('updated'));
      expect(root.firstChild).toBe(main);
      expect(main.textContent).toBe('updated');
      expect(main.lastChild).toBe(second);
    } finally {
      unmount();
    }
    expect(first$.observed).toBe(false);
    expect(second$.observed).toBe(false);
  });

  it('updates the page without losing input focus or resetting either component', () => {
    const root = document.body.appendChild(document.createElement('div'));
    const unmount = mount(root, <Page />);
    const button = root.querySelector('button')!;
    const output = root.querySelector('output')!;
    const input = root.querySelector('input')!;
    try {
      expect(output.textContent).toBe('0');
      expect(root.textContent).toContain('Hello, reader!');
      input.focus();
      input.value = 'Ada';
      input.dispatchEvent(new Event('input'));
      button.click();

      expect(output.textContent).toBe('1');
      expect(root.textContent).toContain('Hello, Ada!');
      expect(root.querySelector('input')).toBe(input);
      expect(document.activeElement).toBe(input);
    } finally {
      unmount();
    }
    button.click();
    expect(root.firstChild).toBeNull();
    expect(output.textContent).toBe('1');
  });

  it('creates independent DOM and state for each subscription', () => {
    const page$ = <Page />;
    const first = document.createElement('div');
    const second = document.createElement('div');
    const unmountFirst = mount(first, page$);
    const unmountSecond = mount(second, page$);
    try {
      first.querySelector('button')!.click();
      expect(first.querySelector('output')?.textContent).toBe('1');
      expect(second.querySelector('output')?.textContent).toBe('0');
    } finally {
      unmountFirst();
      unmountSecond();
    }
  });
});
