import App from './App';

export default () => {
  const element = global.document.getElementById('point');
  const render = App(element);
  render();
};
