import axios from 'axios';

export default class ApiService {
  static #API_KEY = '30641317-2c1589b9e698647cbb48b6071';
  static #BASE_URL = 'https://pixabay.com/api';
  static #IMAGES_PER_PAGE = 40;

  #query;
  #page;
  #canFetchMore;
  #itemsFetched;

  constructor() {
    this.query = '';
  }

  get query() {
    return this.#query;
  }

  set query(newQuery) {
    this.#query = newQuery.trim();
    this.#page = 1;
    this.#canFetchMore = Boolean(this.#query);
    this.#itemsFetched = 0;
  }

  get canFetchMore() {
    return this.#canFetchMore;
  }

  async fetchImages() {
    const data = (
      await axios.get(
        `${ApiService.#BASE_URL}/?key=${ApiService.#API_KEY}&q=${
          this.#query
        }&image_type=photo&orientation=horizontal&safesearch=true&page=${
          this.#page
        }&per_page=${ApiService.#IMAGES_PER_PAGE}`
      )
    ).data;

    if (data.hits.length > 0) {
      this.#page += 1;
      this.#itemsFetched += data.hits.length;
    }

    this.#canFetchMore =
      data.hits.length > 0 && this.#itemsFetched < data.totalHits;

    return data;
  }
}
