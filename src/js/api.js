import axios from 'axios';

const API_KEY = '30641317-2c1589b9e698647cbb48b6071';
const BASE_URL = 'https://pixabay.com/api';
const IMAGES_PER_PAGE = 40;

export default class ApiService {
  constructor() {
    this.query = '';
  }

  get query() {
    return this.searchTerm;
  }

  set query(newQuery) {
    this.searchTerm = newQuery;
    this.page = 1;
    this.canFetchMore = newQuery ? true : false;
    this.itemsFetched = 0;
  }

  async fetchImages() {
    const data = (
      await axios.get(
        `${BASE_URL}/?key=${API_KEY}&q=${this.searchTerm}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=${IMAGES_PER_PAGE}`
      )
    ).data;

    if (data.hits.length > 0) {
      this.page += 1;
      this.itemsFetched += data.hits.length;
      if (this.itemsFetched >= data.totalHits) {
        this.canFetchMore = false;
      }
    } else {
      this.canFetchMore = false;
    }

    return data;
  }
}
