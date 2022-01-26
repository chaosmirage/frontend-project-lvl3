import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import onChange from 'on-change';
import { array, object, string, InferType, ValidationError, addMethod } from 'yup';
import uniqueId from 'lodash/uniqueId';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import i18n from 'i18next';

import * as resources from './locales';
import render from './render';
import makeRequest from './lib/makeRequest';

const feedFormDataSchema = object({
  url: string().url('errorsMessages.invalidURL').required('errorsMessages.notEmpty'),
});

export interface AddingFeed extends InferType<typeof feedFormDataSchema> {}

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
    updatingProcess: {
      state: 'idle' | 'started';
    };
    feeds: Feed[];
    posts: Post[];
  };
  uiState: {
    readPosts: Set<string>;
  };
}

function toProxyUrl(url: string) {
  return `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(
    url
  )}&disableCache=true`;
}

function parseContent(content: string, parse: DOMParser['parseFromString']) {
  const rssDOM = parse(content, 'text/xml');

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

export default () => {
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
      updatingProcess: {
        state: 'idle',
      },
      feeds: [],
      posts: [],
    },
    uiState: {
      readPosts: new Set<string>(),
    },
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();

  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      function updateFeedState(content: string, url: string) {
        const parser = new DOMParser();
        const parse = parser.parseFromString.bind(parser);
        const { feed: loadedFeed, posts: loadedPosts } = parseContent(content, parse);

        const loadedFeeds = [{ ...loadedFeed, url }];

        if (loadedFeed) {
          const newFeeds = differenceWith(loadedFeeds, watchedAppState.feed.feeds, (a, b) => {
            const { id: omittedIdFromA, ...aDataFromApi } = a;
            const { id: omittedIdFromB, ...bDataFromApi } = b;

            return isEqual(aDataFromApi, bDataFromApi);
          });

          if (newFeeds.length > 0) {
            watchedAppState.feed.feeds = loadedFeeds.concat(
              onChange.target(watchedAppState).feed.feeds
            );
          }
        }

        if (loadedPosts) {
          const newPosts = differenceWith(loadedPosts, watchedAppState.feed.posts, (a, b) => {
            const { id: omittedIdFromA, ...aDataFromApi } = a;
            const { id: omittedIdFromB, ...bDataFromApi } = b;

            return isEqual(aDataFromApi, bDataFromApi);
          });

          if (newPosts.length > 0) {
            watchedAppState.feed.posts = newPosts.concat(
              onChange.target(watchedAppState).feed.posts
            );
          }
        }
      }

      function updateFeeds(appState: AppState, options = { interval: 5000 }) {
        setTimeout(() => {
          const requests = appState.feed.feeds.map(({ url }) => makeRequest.get(toProxyUrl(url)));

          return Promise.all(requests)
            .then((results) => {
              results.forEach(({ data }, index) => {
                updateFeedState(data.contents, appState.feed.feeds[index].url);
              });
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              updateFeeds(appState, options);
            });
        }, options.interval);
      }

      const watchedAppState = onChange(appState, function () {
        if (appState.feed.updatingProcess.state === 'idle' && appState.feed.feeds.length > 0) {
          updateFeeds(appState);
          appState.feed.updatingProcess.state = 'started';
        }

        render(
          watchedAppState,
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

        const feedFormData: Pick<Feed, 'url'> = {
          url,
        };

        feedFormDataSchema
          .validate(feedFormData)
          .then(() => {
            const hasFeedAlreadyExist = watchedAppState.feed.feeds.find(
              ({ url }) => feedFormData.url === url
            );

            if (hasFeedAlreadyExist) {
              throw new Error('errorsMessages.duplicateRSS');
            }

            watchedAppState.feed.addingProcess.errors = [];
            watchedAppState.feed.addingProcess.state = 'loading';
            watchedAppState.feed.loadingProcess.state = 'started';
            watchedAppState.feed.validatingProcess.state = 'valid';

            function loadFeed() {
              return makeRequest
                .get(toProxyUrl(url))
                .then((response) => {
                  watchedAppState.feed.loadingProcess.state = 'loaded';
                  watchedAppState.feed.addingProcess.state = 'parsing';
                  watchedAppState.feed.parsingProcess.state = 'started';

                  try {
                    updateFeedState(response.data.contents, url);

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
            }

            loadFeed();
          })
          .catch((error: ValidationError) => {
            console.log(error);
            watchedAppState.feed.addingProcess.errors = [i18nInstance.t(error.message)];
            watchedAppState.feed.validatingProcess.state = 'invalid';
          });
      });
    });
};
