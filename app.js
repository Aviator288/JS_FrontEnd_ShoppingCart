const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "k4jph5wh7958",
  /* This is the access token for this space. Normally you get both ID and the token in the 
  Contentful web app. This is the same asContenet Delivery API*/
  accessToken: "LmUcofPHCaWOuLBK1iJajOeokYzInLh783ryMZlvOps"
});
//console.log(client);
//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//console.log(btns);
//cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting the products locally through json and later through the content management
class Products{
 //get data locally using async
 async getProducts(){
     try{
       // This API call will request an entry with the specified ID from the space defined at the top, using a space-specific access token.
       let contentful = await client.getEntries({
        content_type:"shoppingCart" 
       });
       
       console.log(contentful);
       //to get items or products locally from the json file
       /* let result = await fetch('products.json');
        let data = await result.json();*/
        //let products = data.items;
        
        //to get items or produtcs from contentful
        let products = contentful.items;
        products = products.map(item => {
            const{title, price} = item.fields;
            const{id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title, price, id, image};
        })
        return products;
     }catch(error){
        console.log(error);
     }
 
 /*async function fetchMoviesJSON() {
  const response = await fetch('/movies');
  const movies = await response.json();
  return movies;
}*/

    
 }
}
//display products after getting it from class Products
class UI{
 displayProducts(products){
     let result = "";
     //loop through the items of each and every products and add data dynamically
    products.forEach(product => {
      result += `
   <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
        <!-- end of single product -->
   `;
    });
    productsDOM.innerHTML = result; 
 }
 getBagButtons(){
  const buttons = [...document.querySelectorAll(".bag-btn")];
  buttonsDOM = buttons;

  buttons.forEach(button =>{
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if(inCart){
          button.innerText = "In Cart";
          button.disabled = true;
      }
        button.addEventListener("click", event=>{
            event.target.innerText = "In Cart";
            event.target.disabled = true;
            //get product from products based on the id
            let cartItem = { ...Storage.getProducts(id), amount:1};
            //add product to the cart
            cart = [...cart, cartItem];
            //console.log(cart);
            //save cart in local storage
            Storage.saveCart(cart);
            //set cart values
            this.setCartValues(cart);
            //display cart item
            this.addCartItem(cartItem);
            //show the cart
            this.showCart();
        });
      
  });
 }

 setCartValues(cart){
    let tempTotal =0;
    let itemsTotal =0;
    cart.map(item =>{
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartTotal, cartItems);
  }
  addCartItem(item){
    //create a div
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product"/>
              <div>
                  <h4>${item.title}</h4>
                  <h5>$${item.price}</h5>
                  <span class="remove-item" data-id=${item.id}>remove</span>
              </div>
              <div>
                <i class="fa fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fa fa-chevron-down" data-id=${item.id}></i>
              </div>`;
              cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic(){
    //clear cart button
    clearCartBtn.addEventListener("click", ()=>{
      this.clearCart();
    });
    //Cart functionality
    cartContent.addEventListener("click", event=>{
      if(event.target.classList.contains("remove-item")){
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }else if(event.target.classList.contains("fa-chevron-up")){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id ===id);
        tempItem.amount = tempItem.amount + 1; 
        Storage.saveCart(cart); /* update the value of the item to local storage including cart total*/
        this.setCartValues(cart);
        //traverse the DOM to locate amount and set the amount to the current amount in tempitem.amount
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if(event.target.classList.contains("fa-chevron-down")){
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id ===id);
        tempItem.amount = tempItem.amount - 1; 
        if(tempItem.amount > 0){
          Storage.saveCart(cart); /* update the value of the item to local storage including cart total*/
          this.setCartValues(cart);
          /*traverse the DOM to locate amount and set the amount to the current amount in
           tempitem.amount*/
            lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        } 
      }
    });
    
  }
  clearCart(){
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);

    while(cartContent.children.length>0){
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id){
    //filter or return items that do not have an id
    cart = cart.filter(item =>item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-shopping-cart"></i> add to cart`;
  }
  //to get the button that was used to add item to the cart
  getSingleButton(id){
    return buttonsDOM.find(button=> button.dataset.id === id);
  }
}

/*Note: No need to create a instance in static method */
//local storage
class Storage{
 static saveProducts(products){
    localStorage.setItem("products", JSON.stringify(products));
 }
 static getProducts(id){
     let products = JSON.parse(localStorage.getItem('products'));
     return products.find(product => product.id === id);
 }
 static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
 }
 static getCart(){
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
 }
}
//event listener
document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    ui.setupAPP();
    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() =>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});
