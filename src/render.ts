import type { AppState, AppRenderElements } from './runApp';
import type { i18n } from 'i18next';

function renderAddingForm(state: AppState, elements: AppRenderElements, { t }: i18n) {
  const {
    addingFormFeedbackElement,
    addingFormElement,
    addingFormInputElement,
    addingFormSubmitButtonElement,
  } = elements;

  const {
    feed: { addingProcess, validatingProcess, loadingProcess, parsingProcess },
  } = state;

  if (addingProcess.state === 'validating' && validatingProcess.state === 'invalid') {
    addingFormFeedbackElement.classList.remove('text-danger', 'text-success');
    addingFormFeedbackElement.classList.add('text-danger');
    addingFormInputElement.classList.add('is-invalid');

    addingFormFeedbackElement.textContent = addingProcess.errors.join('\n');
  }

  if (addingProcess.state === 'loading' && loadingProcess.state === 'started') {
    addingFormFeedbackElement.classList.remove('text-danger', 'text-success');
    addingFormInputElement.classList.remove('is-invalid');
    addingFormFeedbackElement.textContent = '';
    addingFormSubmitButtonElement.setAttribute('disabled', 'true');
    addingFormInputElement.setAttribute('readonly', 'true');
  }

  if (addingProcess.state === 'loading' && loadingProcess.state === 'error') {
    addingFormFeedbackElement.classList.remove('text-danger', 'text-success');
    addingFormSubmitButtonElement.removeAttribute('disabled');
    addingFormInputElement.removeAttribute('readonly');

    addingFormFeedbackElement.classList.add('text-danger');
    addingFormFeedbackElement.textContent = t('errorsMessages.networkError');
  }

  if (addingProcess.state === 'loading' && loadingProcess.state === 'loaded') {
    addingFormFeedbackElement.classList.remove('text-danger', 'text-success');
    addingFormSubmitButtonElement.removeAttribute('disabled');
    addingFormInputElement.removeAttribute('readonly');

    addingFormFeedbackElement.classList.add('text-success');

    addingFormFeedbackElement.textContent = t('successMessages.loadedRSS');

    addingFormElement.reset();
    addingFormInputElement.focus();
  }

  if (addingProcess.state === 'parsing' && parsingProcess.state === 'error') {
    addingFormFeedbackElement.classList.remove('text-danger', 'text-success');

    addingFormFeedbackElement.classList.add('text-danger');
    addingFormFeedbackElement.textContent = t('errorsMessages.invalidRSS');
  }
}

function renderPosts(state: AppState, elements: AppRenderElements, { t }: i18n) {
  const { postsContainerElement } = elements;

  const {
    feed: { posts },
  } = state;

  postsContainerElement.innerHTML = `
    <div class="card-body">
        <h2 class="card-title h4">${t('titles.feeds')}</h2>
    </div>
  `;

  const postsListContainerElement = document.createElement('ul');
  postsListContainerElement.classList.add('list-group', 'border-0', 'rounded-0');

  const postsItemsElements = posts.map((currentPost) => {
    const itemElement = document.createElement('li');

    itemElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0'
    );

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    link.href = currentPost.url;
    link.textContent = currentPost.title;

    if (state.uiState.readPosts.has(currentPost.id)) {
      link.classList.add('fw-normal', 'link-secondary');
    } else {
      link.classList.add('fw-bold');
    }

    link.addEventListener(
      'click',
      (
        ({ id }) =>
        () => {
          if (!state.uiState.readPosts.has(id)) {
            state.uiState.readPosts.add(id);
          }
        }
      )(currentPost)
    );

    const lookButton = document.createElement('button');

    lookButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    lookButton.setAttribute('type', 'button');
    lookButton.setAttribute('data-bs-toggle', 'modal');
    lookButton.setAttribute('data-bs-target', '#modal');

    lookButton.addEventListener(
      'click',
      (
        ({ title, description, url, id }) =>
        () => {
          const modalTitleElement = document.querySelector('.modal-title');
          const modalBodyElement = document.querySelector('.modal-body');
          const goToSourceElement = document.querySelector('.modal .full-article');

          if (modalTitleElement) {
            modalTitleElement.textContent = title;
          }

          if (modalBodyElement) {
            modalBodyElement.textContent = description;
          }

          if (goToSourceElement) {
            goToSourceElement.setAttribute('href', url);
          }

          if (!state.uiState.readPosts.has(id)) {
            state.uiState.readPosts.add(id);
          }
        }
      )(currentPost)
    );

    lookButton.textContent = `${t('actions.look')}`;

    itemElement.append(link, lookButton);

    return itemElement;
  });

  postsListContainerElement.append(...postsItemsElements);
  postsContainerElement.appendChild(postsListContainerElement);
}

function renderFeeds(state: AppState, elements: AppRenderElements, { t }: i18n) {
  const { feedsContainerElement } = elements;

  const {
    feed: { feeds },
  } = state;

  feedsContainerElement.innerHTML = `
    <div class="card border-0">
      <div class="card-body"><h2 class="card-title h4">${t('titles.feeds')}</h2>
    </div>
  `;

  const postsListContainerElement = document.createElement('ul');
  postsListContainerElement.classList.add('list-group', 'border-0', 'rounded-0');

  const feedsItemsElements = feeds.map((currentFeed) => {
    const itemElement = document.createElement('li');

    itemElement.classList.add('list-group-item', 'border-0', 'border-end-0');

    const headerElement = document.createElement('h3');
    headerElement.classList.add('h6', 'm-0');
    headerElement.textContent = currentFeed.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.classList.add('m-0', 'small', 'text-black-50');
    descriptionElement.textContent = currentFeed.description;

    itemElement.append(headerElement, descriptionElement);

    return itemElement;
  });

  postsListContainerElement.append(...feedsItemsElements);
  feedsContainerElement.appendChild(postsListContainerElement);
}

export default (state: AppState, elements: AppRenderElements, i18n: i18n) => {
  const {
    feed: { feeds, posts },
  } = state;

  renderAddingForm(state, elements, i18n);

  if (posts.length > 0) {
    renderPosts(state, elements, i18n);
  }

  if (feeds.length > 0) {
    renderFeeds(state, elements, i18n);
  }
};
