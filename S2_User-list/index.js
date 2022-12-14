const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/';
const USERS_PER_PAGE = 20;

// get html element
const dataPanel = document.querySelector('#data-panel');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const paginator = document.querySelector('#paginator');
const topButton = document.getElementById('topBtn'); // Get Back To Top button

// parameters
const users = []; // store users
const favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []; // get favorite list
let filteredUsers = []; // store filtered users
let currentPage = 1;

function scrollFunction() {
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    topButton.style.display = 'block';
  } else {
    topButton.style.display = 'none';
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// functions
function renderUserList(data) {
  let rowHTML = '';
  let idList = [];

  // filter user id from favorite list
  if (favoriteList) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < favoriteList.length; j++) {
        if (data[i].id === favoriteList[j].id) {
          idList.push(favoriteList[j].id);
        }
      }
    }
  }

  // render user list
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
            <h5 class="card-title fw-bolder mb-4">${item.name} ${
      item.surname
    }</h5>
            <button
              class="btn btn-primary btn-sm btn-show-user"
              data-bs-toggle="modal"
              data-bs-target="#user-modal"
              data-id="${item.id}">Info</button>
            <button class="btn ${
              idList.find((id) => id === item.id)
                ? 'btn-danger'
                : 'btn-secondary'
            } btn-sm btn-add-favorite"
              data-id="${item.id}">Like</button>
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
    .get(BASE_URL + id)
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

function addToFavorite(id) {
  const user = users.find((user) => user.id === id); // find user by id

  // update list and local storage
  if (favoriteList.some((user) => user.id === id)) {
    const index = favoriteList.findIndex((user) => user.id === id);
    favoriteList.splice(index, 1);
    // return alert('?????????????????????????????????');
  } else {
    favoriteList.push(user);
  }
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList));
}

function changeFavoriteBtnStyle(btn) {
  if (btn.matches('.btn-secondary')) {
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-danger');
  } else {
    btn.classList.remove('btn-danger');
    btn.classList.add('btn-secondary');
  }
}

function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const data = filteredUsers.length ? filteredUsers : users;
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = '';

  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
  paginator.firstElementChild.classList.add('active');
}

// 1. Get users data and render html
axios
  .get(BASE_URL)
  .then((res) => {
    users.push(...res.data.results);
    renderPaginator(users.length);
    renderUserList(getUsersByPage(1));
  })
  .catch((err) => console.log(err));

// 2. Show user info in modal
dataPanel.addEventListener('click', function (e) {
  if (e.target.matches('.btn-show-user')) {
    showUserModal(e.target.dataset.id);
  } else if (e.target.matches('.btn-add-favorite')) {
    // 4. add favorite user
    addToFavorite(Number(e.target.dataset.id));
	changeFavoriteBtnStyle(e.target);
  }
});

// 3. Search user
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // catch input keyword
  const keyword = searchInput.value.trim().toLowerCase();

  // search user by name or surname
  filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.surname.toLowerCase().includes(keyword)
  );

  // check user exist
  if (filteredUsers.length === 0) {
    return alert('???????????????');
  }

  // render users html after search
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
});

// 5. paginator setting
paginator.addEventListener('click', function (e) {
  if (e.target.tagName !== 'A') {
    return;
  }

  // remove .active from old page
  const activeLi = document.querySelector('.active');
  activeLi.classList.remove('active');

  // add .active to new page
  currentPage = Number(e.target.dataset.page);
  e.target.parentElement.classList.add('active');

  renderUserList(getUsersByPage(currentPage));
});

// 6. When the user scrolls down 100px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};
