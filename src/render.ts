import type { AppState, AppRenderElements } from './app';
import type { i18n } from 'i18next';

export default (state: AppState, elements: AppRenderElements, { t }: i18n) => {
  const { addingFormFeedbackElement, addingFormElement, addingFormInputElement } = elements;
  const { addingFeedProcess } = state;

  if (addingFeedProcess.state === 'invalid') {
    addingFormInputElement.classList.add('is-invalid');
    addingFormFeedbackElement.textContent = addingFeedProcess.errors.join('\n');
  }

  if (addingFeedProcess.state === 'success') {
    addingFormInputElement.classList.remove('is-invalid');
    addingFormElement.reset();
    addingFormInputElement.focus();
  }
};
