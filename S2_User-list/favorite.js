const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/';
const INDEX_URL = BASE_URL + '/api/v1/users/';
const USERS_PER_PAGE = 20;

// get html element
const dataPanel = document.querySelector('#data-panel');

// parameters
const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []; // store users
let filteredUsers = []; // store filtered users
let currentPage = 1;

// functions
function renderUserList(data) {
  let rowHTML = '';
  data.forEach((item) => {
    rowHTML += `
    <div class="col-sm-3">
      <div class="mb-3">
        <div class="card">
          <img
            src="${item.avatar}"
            class="card-img-top"
            alt="User Poster"
          />
          <div class="card-body">
            <h5 class="card-title fw-bolder mb-4">${item.name} ${item.surname}</h5>
            <button
              class="btn btn-primary btn-sm btn-show-user"
              data-bs-toggle="modal"
              data-bs-target="#user-modal"
              data-id="${item.id}">Info</button>
            <button class="btn btn-danger btn-sm  btn-remove-favorite"
              data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rowHTML;
}

function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-title');
  const modalImage = document.querySelector('#user-modal-image');
  const modalEmail = document.querySelector('#user-modal-email');
  const modalGender = document.querySelector('#user-modal-gender');
  const modalAge = document.querySelector('#user-modal-age');
  const modalRegion = document.querySelector('#user-modal-region');
  const modalBirthday = document.querySelector('#user-modal-birthday');

  // get user info and set model
  axios
    .get(BASE_URL)
    .then((res) => {
      const data = res.data;
      modalTitle.innerText = `${data.name} ${data.surname}`;
      modalEmail.innerText = 'Email: ' + data.email;
      modalGender.innerText = 'Gender: ' + data.gender;
      modalAge.innerText = 'Age: ' + data.age;
      modalRegion.innerText = 'Region: ' + data.region;
      modalBirthday.innerText = 'Birthday: ' + data.birthday;
      modalImage.innerHTML = `<img src="${data.avatar}" alt="user-poster" class="img-fluid rounded">`;
    })
    .catch((err) => {
      console.log(err);
    });
}

function removeFromFavorite(id) {
  const index = users.findIndex((user) => user.id === id);

  // remove user from favorite list
  users.splice(index, 1);

  // set local storage and refresh html
  localStorage.setItem('favoriteUsers', JSON.stringify(users));
  renderPaginator(users.length);
  renderUserList(getUsersByPage(currentPage));
}

function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE;
  return users.slice(startIndex, startIndex + USERS_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = '';

  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

// 1. Get favorite users data and render html
renderPaginator(users.length);
renderUserList(getUsersByPage(currentPage));

// 2. Show user info in modal
dataPanel.addEventListener('click', function (e) {
  if (e.target.matches('.btn-show-user')) {
    showUserModal(e.target.dataset.id);
  } else if (e.target.matches('.btn-remove-favorite')) {
    // 3. remove favorite user
    removeFromFavorite(Number(e.target.dataset.id));
  }
});

// 3. paginator setting
paginator.addEventListener('click', function (e) {
  if (e.target.tagName !== 'A') {
    return;
  }
  currentPage = Number(e.target.dataset.page);

  renderUserList(getUsersByPage(currentPage));
});
