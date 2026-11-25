import { h, mount } from './dom';
import { Page } from './page';
import './style.css';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app mount point');

const unmount = mount(root, <Page />);
if (import.meta.hot) import.meta.hot.dispose(unmount);
