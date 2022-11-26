const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';

const MOVIES_PER_PAGE = 12; // 每頁只顯示 12 筆資料
const movies = []; // store movie list
let filteredMovies = []; //儲存符合篩選條件的項目
let modeFlag = 0; // 0 : card mode, 1 : list mode
let currentPage = 1;

const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const layoutSwitch = document.querySelector('#layoutMode');

function renderMovieList(data) {
  let rowHTML = '';
  if (modeFlag === 0) {
    data.forEach((item) => {
      rowHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top"
              alt="Movie Poster"
            />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>`;
    });
  } else if (modeFlag === 1) {
    data.forEach((item) => {
      rowHTML += `
        <li class="list-group-item">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${item.title}</h5>
            <div>
              <button
                class="btn btn-primary btn-show-movie"
                data-bs-toggle="modal"
                data-bs-target="#movie-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </li>`;
    });
    rowHTML = `<ul class="list-group list-group-flush">${rowHTML}</ul>`;
  }

  dataPanel.innerHTML = rowHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-date');
  const modalDescription = document.querySelector('#movie-modal-description');

  // get movie info
  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const data = res.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = 'Release date: ' + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
    })
    .catch((err) => {
      console.log(err);
    });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
  const movie = movies.find((movie) => movie.id === id); // 在 movies 陣列中，識別出被點擊的那部 movie 資料，將那部 movie 資料暫存起來

  // 錯誤處理：已經在收藏清單的電影，不應被重複加
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！');
  }
  // 暫存起來以後放到收藏清單
  list.push(movie);
  // 將收藏清單存到 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(list));
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = '';

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

// get movie list
axios
  .get(INDEX_URL)
  .then((res) => {
    movies.push(...res.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1)); // 一開始顯示第一頁的內容
  })
  .catch((err) => {
    console.log(err);
  });

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();

  const keyword = searchInput.value.trim().toLowerCase(); //取得搜尋關鍵字

  // //錯誤處理：輸入無效字串
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！');
  // }

  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  //重製分頁器
  renderPaginator(filteredMovies.length);

  //預設顯示第 1 頁的搜尋結果
  currentPage = 1;
  renderMovieList(getMoviesByPage(currentPage));
});

//監聽分頁器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return;

  //透過 dataset 取得被點擊的頁數
  currentPage = Number(event.target.dataset.page);
  //更新畫面
  renderMovieList(getMoviesByPage(currentPage));
});

//監聽切換模式
layoutSwitch.addEventListener('click', function (e) {
  if (e.target.matches('#cardMode')) {
    if (modeFlag === 1) {
      // list mode => card mode
      modeFlag = 0;
      renderMovieList(getMoviesByPage(currentPage));
    }
  } else if (e.target.matches('#listMode')) {
    if (modeFlag === 0) {
      // card mode => list mode
      modeFlag = 1;
      renderMovieList(getMoviesByPage(currentPage));
    }
  }
});
