import onChange from 'on-change';
import type { i18n } from 'i18next';
import { array, object, string, InferType, ValidationError, addMethod } from 'yup';
import render from './render';

declare module 'yup' {
  interface ArraySchema<T, C> {
    unique(message: string, mapper: (a: C) => C[keyof C]): ArraySchema<T>;
  }
}

addMethod(array, 'unique', function (message, mapper = (a: unknown) => a) {
  return this.test('unique', message, function (list) {
    if (!list) {
      return true;
    }

    return list.length === new Set(list.map(mapper)).size;
  });
});

const feedSchema = object({
  url: string().matches(
    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    'addingFeedProcess.errors.invalidURL'
  ),
});

export const feedsSchema = array()
  .of(feedSchema)
  .unique('addingFeedProcess.errors.duplicateRSS', (value) => value.url);

export interface Feed extends InferType<typeof feedSchema> {}

export interface AppState {
  addingFeedProcess: {
    state: 'idle' | 'invalid' | 'success';
    errors: string[];
    data: Feed[];
  };
}

export interface AppRenderElements {
  addingFormFeedbackElement: HTMLElement;
  addingFormElement: HTMLFormElement;
  addingFormInputElement: HTMLInputElement;
}

export default (i18nInstance: i18n) => () => {
  const addingFormFeedbackElement: HTMLElement | null = document.querySelector('.feedback');
  const addingFormElement: HTMLFormElement | null = document.querySelector('.rss-form');
  const addingFormInputElement: HTMLInputElement | null = document.querySelector('#url-input');

  if (!addingFormElement || !addingFormFeedbackElement || !addingFormInputElement) {
    throw new Error('Elements not found');
    return;
  }

  const appState: AppState = {
    addingFeedProcess: {
      state: 'idle',
      errors: [],
      data: [],
    },
  };

  const watchedAppState = onChange(appState, function () {
    render(
      appState,
      { addingFormFeedbackElement, addingFormElement, addingFormInputElement },
      i18nInstance
    );
  });

  addingFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(addingFormElement);

    const url = formData.get('url') as string;

    const newFeedData: Feed = {
      url,
    };

    const newFeedsData = [...onChange.target(watchedAppState).addingFeedProcess.data, newFeedData];

    feedsSchema
      .validate(newFeedsData)
      .then(() => {
        watchedAppState.addingFeedProcess.data = newFeedsData;
        watchedAppState.addingFeedProcess.errors = [];
        watchedAppState.addingFeedProcess.state = 'success';
      })
      .catch((error: ValidationError) => {
        watchedAppState.addingFeedProcess.errors = [i18nInstance.t(error.message)];
        watchedAppState.addingFeedProcess.state = 'invalid';
      });
  });
};
