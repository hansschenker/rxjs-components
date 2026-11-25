import { combineLatest, defer, isObservable, map, of, type Observable } from 'rxjs';

export type View = Observable<Node>;
export type Child = Observable<Node | readonly Node[]> | Node | string | number | boolean | null | undefined | Child[];

interface Attributes {
  id?: string;
  className?: string;
  type?: string;
  htmlFor?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
}

export namespace h {
  export namespace JSX {
    export type Element = View;
    export interface ElementChildrenAttribute { children: unknown }
    export type IntrinsicElements = {
      [Tag in keyof HTMLElementTagNameMap]: Attributes & { children?: Child };
    };
  }
}

function childNodes(child: Child): Observable<Node[]> {
  if (Array.isArray(child)) {
    return child.length ? combineLatest(child.map(childNodes)).pipe(map(parts => parts.flat())) : of([]);
  }
  if (isObservable(child)) return child.pipe(map(value => 'nodeType' in value ? [value] : [...value]));
  if (child == null || typeof child === 'boolean') return of([]);
  if (typeof child === 'string' || typeof child === 'number') {
    return of([document.createTextNode(String(child))]);
  }
  return of([child]);
}

export function h(
  tag: string,
  props: Attributes | null,
  ...children: Child[]
): View;
export function h<Props extends object>(
  component: (props: Props) => View,
  props: Props | null,
  ...children: Child[]
): View;
export function h<Props extends object>(
  tag: string | ((props: Props) => View),
  props: Props | null,
  ...children: Child[]
): View {
  if (typeof tag === 'function') {
    return defer(() => tag({
      ...props,
      ...(children.length ? { children: children.length === 1 ? children[0] : children } : {}),
    } as Props));
  }

  return defer(() => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(props ?? {})) {
      if (value == null || name === 'children') continue;
      const attribute = name === 'className' ? 'class' : name === 'htmlFor' ? 'for' : name;
      element.setAttribute(attribute, String(value));
    }

    const content = children.length ? children : (props as { children?: Child } | null)?.children;
    return childNodes(content).pipe(map(nodes => {
      const nextNodes = new Set(nodes);
      for (const current of Array.from(element.childNodes)) {
        if (!nextNodes.has(current)) current.remove();
      }
      nodes.forEach((node, index) => {
        const current = element.childNodes.item(index);
        if (node !== current) element.insertBefore(node, current);
      });
      return element;
    }));
  });
}

/** Bind stream values to one native text node per subscription. */
export function bindText(source: Observable<string | number | null | undefined>): Observable<Text> {
  return defer(() => {
    const text = document.createTextNode('');
    return source.pipe(map(value => {
      text.data = value == null ? '' : String(value);
      return text;
    }));
  });
}

export function mount(container: HTMLElement, view: View) {
  let current: Node | undefined;
  const subscription = view.subscribe(node => {
    if (node === current) return;
    container.replaceChildren(node);
    current = node;
  });

  return () => {
    subscription.unsubscribe();
    if (current?.parentNode === container) container.removeChild(current);
  };
}
