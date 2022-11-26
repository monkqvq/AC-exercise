// 3.變數宣告
const menu = document.getElementById('menu');
const cart = document.getElementById('cart');
const totalAmount = document.getElementById('total-amount');
const button = document.getElementById('submit-button');

let total = 0;
let productData = [];
let cartItems = [];
// [
//   {
//     id: 'product-1',
//     name: '馬卡龍',
//     price: 60,
//     quantity: 1
//   },
//   {
//     id: 'product-2',
//     name: '草莓',
//     price: 100,
//     quantity: 2
//   },
// ]

// 5. 將產品資料加入菜單區塊
function displayProduct(products) {
  products.forEach(
    (product) =>
      (menu.innerHTML += `
    <div class="col-3">
       <div class="card">
          <img src=${product.imgUrl} class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <a href="#" id=${product.id} class="btn btn-primary">加入購物車</a>
          </div>
        </div>
      </div>
  `)
  );
}

// 7.計算總金額
function calculateTotal(price) {
  total += price;
  totalAmount.innerHTML = total;
}

// 4.GET API 菜單產品資料
axios
  .get('https://ac-w3-dom-pos.firebaseio.com/products.json')
  .then((res) => {
    productData.push(...res.data);

    displayProduct(productData);
  })
  .catch((err) => console.log(err));

// 6.加入購物車
function addToCart(event) {
  // 找到觸發event的node元素，並得到其產品id
  const id = event.target.id;

  // 在productData的資料裡，找到點擊的產品資訊，加入 cartItems
  const addedProduct = productData.find((product) => product.id === id);
  const name = addedProduct.name;
  const price = addedProduct.price;

  // 加入購物車變數cartItems 分：有按過、沒按過
  const targetItem = cartItems.find((item) => item.id === id);

  if (targetItem) {
    targetItem.quantity += 1;
  } else {
    cartItems.push({
      id: id,
      name: name,
      price: price,
      quantity: 1,
    });
  }

  // 畫面顯示購物車清單
  cart.innerHTML = cartItems
    .map(
      (item) =>
        `<li class="list-group-item">${item.name} X ${item.quantity} 小計：${
          item.price * item.quantity
        }</li>`
    )
    .join('');

  // 計算總金額
  calculateTotal(price);
}

// 8.送出訂單
function submit() {
  alert(`感謝購買\n總金額 : ${total}`);
}

// 9.重置資料
function reset() {
  cartItems = [];
  cart.innerHTML = '';
  total = 0;
  totalAmount.innerHTML = 0;
}

// 10. 加入事件監聽
menu.addEventListener('click', (e) => {
  addToCart(e);
});

button.addEventListener('click', function (e) {
  if (total !== 0) {
    submit();
    reset();
  }
});
