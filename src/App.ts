export default (element: HTMLElement | null) => () => {
  if (!element) {
    return;
  }
  element.textContent = 'hello, world!';
  console.log('ehu!');
};
