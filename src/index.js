import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ApiService from './js/api';

const lightbox = new SimpleLightbox('.gallery a');
const api = new ApiService();

const refs = {
  searchForm: document.querySelector('#search-form'),
  // loadMoreButton: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
  // galleryEnd: document.querySelector('.gallery-end'),
};

refs.galleryEnd = document.createElement('div');
refs.gallery.insertAdjacentElement('afterend', refs.galleryEnd);

refs.searchForm.addEventListener('submit', onSearchFormSubmit);
// refs.loadMoreButton.addEventListener('click', loadMoreImages);

let observer = new IntersectionObserver(onEmergeInScreen, {
  rootMargin: '0px 0px 600px 0px',
});

function notifyNoImages() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function notifyNoMoreImages() {
  Notiflix.Notify.warning(
    "We're sorry, but you've reached the end of search results."
  );
}

function nofityTotalHits(totalHits) {
  Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
}

function createGalleryCardMarkup(image) {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = image;
  return `<div class="photo-card">
  <a href="${largeImageURL}">
  <img class="photo" src="${webformatURL}" alt="${tags}" title="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
  </a>
</div>`;
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function appendGallery(images) {
  const markup = images.map(createGalleryCardMarkup).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

async function onSearchFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  api.query = form.elements.searchQuery.value.trim();

  observer.disconnect();
  clearGallery();

  if (!api.canFetchMore) {
    return;
  }

  try {
    const images = await api.fetchImages();

    if (images.totalHits === 0) {
      notifyNoImages();
      return;
    }

    nofityTotalHits(images.totalHits);

    appendGallery(images.hits);

    if (!api.canFetchMore) {
      notifyNoMoreImages();
      return;
    }

    observer.observe(refs.galleryEnd);
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure(e.message);
  }
}

async function loadMoreImages() {
  if (!api.canFetchMore) {
    return;
  }

  try {
    const images = await api.fetchImages();
    appendGallery(images.hits);

    if (!api.canFetchMore) {
      notifyNoMoreImages();
      observer.disconnect();
      return;
    }
  } catch (e) {
    console.error(e);
    Notiflix.Notify.failure(e.message);
  }
}

function onEmergeInScreen([entry]) {
  if (entry.isIntersecting) {
    loadMoreImages();
  }
}
