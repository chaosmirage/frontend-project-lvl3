import onChange from 'on-change';
import type { i18n } from 'i18next';
import { array, object, string, InferType, ValidationError, addMethod } from 'yup';
import uniqueId from 'lodash/uniqueId';
import render from './render';
import makeRequest from './lib/makeRequest';

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
  url: string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'errorsMessages.invalidURL'
    )
    .required(),
});

export const feedsSchema = array()
  .of(feedSchema)
  .unique('errorsMessages.duplicateRSS', (value) => value.url);

export interface AddingFeed extends InferType<typeof feedSchema> {}

export interface Feed {
  url: AddingFeed['url'];
  title: string;
  description: string;
  id: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  url: string;
}

export interface AppState {
  feed: {
    addingProcess: {
      state: 'idle' | 'validating' | 'loading' | 'parsing';
      errors: string[];
    };
    validatingProcess: {
      state: 'idle' | 'invalid' | 'valid';
    };
    loadingProcess: {
      state: 'idle' | 'started' | 'loaded' | 'error';
    };
    parsingProcess: {
      state: 'idle' | 'started' | 'error';
    };
    feeds: Feed[];
    posts: Post[];
  };
}

function toProxyUrl(url: string) {
  return `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(
    url
  )}&disableCache=true`;
}

function parseContent(content: string, parse: DOMParser['parseFromString']) {
  const rssDOM = parse(content, 'text/xml');
  console.log('🚀 ~ file: App.ts ~ line 79 ~ parseContent ~ rssDOM', rssDOM);

  const errorNode = rssDOM.querySelector('parsererror');
  if (errorNode) {
    throw new Error('errorsMessages.invalidRSS');
  }

  const title = rssDOM.querySelector('channel > title');
  const description = rssDOM.querySelector('channel > description');

  const feed: Omit<Feed, 'url'> = {
    id: uniqueId(),
    title: title?.textContent || '',
    description: description?.textContent || '',
  };

  const postsElements = rssDOM.querySelectorAll('item');

  const posts: Post[] = Array.from(postsElements).reduce((acc, item) => {
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const link = item.querySelector('link');

    acc.push({
      id: uniqueId(),
      title: title?.textContent || '',
      description: description?.textContent || '',
      url: link?.textContent || '',
    });

    return acc;
  }, [] as Post[]);

  return { posts, feed };
}

export interface AppRenderElements {
  addingFormFeedbackElement: HTMLElement;
  addingFormElement: HTMLFormElement;
  addingFormInputElement: HTMLInputElement;
  addingFormSubmitButtonElement: HTMLButtonElement;
  postsContainerElement: HTMLDivElement;
  feedsContainerElement: HTMLDivElement;
}

export default (i18nInstance: i18n) => () => {
  const addingFormFeedbackElement: HTMLElement | null = document.querySelector('.feedback');
  const addingFormElement: HTMLFormElement | null = document.querySelector('.rss-form');
  const addingFormInputElement: HTMLInputElement | null = document.querySelector('#url-input');
  const addingFormSubmitButtonElement: HTMLButtonElement | null | undefined =
    addingFormElement?.querySelector('button[type="submit"]');
  const postsContainerElement: HTMLDivElement | null = document.querySelector('.posts');
  const feedsContainerElement: HTMLDivElement | null = document.querySelector('.feeds');

  if (
    !addingFormElement ||
    !addingFormFeedbackElement ||
    !addingFormInputElement ||
    !addingFormSubmitButtonElement ||
    !postsContainerElement ||
    !feedsContainerElement
  ) {
    throw new Error('Elements not found');
    return;
  }

  const appState: AppState = {
    feed: {
      addingProcess: {
        state: 'idle',
        errors: [],
      },
      validatingProcess: {
        state: 'idle',
      },
      loadingProcess: {
        state: 'idle',
      },
      parsingProcess: {
        state: 'idle',
      },
      feeds: [],
      posts: [],
    },
  };

  const watchedAppState = onChange(appState, function () {
    render(
      appState,
      {
        addingFormFeedbackElement,
        addingFormElement,
        addingFormInputElement,
        addingFormSubmitButtonElement,
        postsContainerElement,
        feedsContainerElement,
      },
      i18nInstance
    );
  });

  addingFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    watchedAppState.feed.addingProcess.state = 'validating';
    watchedAppState.feed.loadingProcess.state = 'idle';
    watchedAppState.feed.validatingProcess.state = 'idle';
    watchedAppState.feed.parsingProcess.state = 'idle';

    const formData = new FormData(addingFormElement);

    const url = formData.get('url') as string;

    const newFeedData: Pick<Feed, 'url'> = {
      url,
    };

    const newFeedsData = [...onChange.target(watchedAppState).feed.feeds, newFeedData];

    feedsSchema
      .validate(newFeedsData)
      .then(() => {
        watchedAppState.feed.addingProcess.errors = [];
        watchedAppState.feed.addingProcess.state = 'loading';
        watchedAppState.feed.loadingProcess.state = 'started';
        watchedAppState.feed.validatingProcess.state = 'valid';

        makeRequest
          .get(toProxyUrl(url))
          .then((response) => {
            watchedAppState.feed.loadingProcess.state = 'loaded';
            watchedAppState.feed.addingProcess.state = 'parsing';
            watchedAppState.feed.parsingProcess.state = 'started';

            const parser = new DOMParser();
            const parse = parser.parseFromString.bind(parser);

            try {
              const { feed: newFeed, posts: newPosts } = parseContent(
                response.data.contents,
                parse
              );

              if (newFeed && newPosts) {
                watchedAppState.feed.feeds = [{ ...newFeed, url }].concat(
                  watchedAppState.feed.feeds
                );
                watchedAppState.feed.posts = newPosts.concat(watchedAppState.feed.posts);
              }

              watchedAppState.feed.addingProcess.state = 'idle';
              watchedAppState.feed.parsingProcess.state = 'idle';
            } catch (error) {
              console.log(error);
              watchedAppState.feed.parsingProcess.state = 'error';
            }
          })
          .catch((error) => {
            console.log(error);
            watchedAppState.feed.loadingProcess.state = 'error';
          });
      })
      .catch((error: ValidationError) => {
        console.log(error);
        watchedAppState.feed.addingProcess.errors = [i18nInstance.t(error.message)];
        watchedAppState.feed.validatingProcess.state = 'invalid';
      });
  });
};
