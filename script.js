const items = [
    // Hot Coffee
    {id:1,name:'Espresso',type:'hot',price:120,img:'img/hot1.jpg',stock:10},
    {id:2,name:'Cappuccino',type:'hot',price:150,img:'img/hot2.jpg',stock:8},
    {id:3,name:'Latte',type:'hot',price:170,img:'img/hot3.jpg',stock:10},
    // Cold Coffee
    {id:4,name:'Iced Coffee',type:'cold',price:130,img:'img/cold1.jpg',stock:5},
    {id:5,name:'Cold Latte',type:'cold',price:150,img:'img/cold2.jpg',stock:6},
    // Frappuccino
    {id:6,name:'Mocha Frappe',type:'frappuccino',price:180,img:'img/frap1.jpg',stock:5},
    {id:7,name:'Caramel Frappe',type:'frappuccino',price:200,img:'img/frap2.jpg',stock:7},
    // Cakes
    {id:8,name:'Butterscotch Crunch',type:'cakes',price:350,img:'img/cakebutterscotchcrunch.jpg',stock:5},
    {id:9,name:'Red Velvet Cake',type:'cakes',price:400,img:'img/cakeredvelvet.jpg',stock:4},
    {id:10,name:'Dark Forest Cake',type:'cakes',price:450,img:'img/cakedarkforest.jpg',stock:3},
    {id:11,name:'Dutch Truffle Cake',type:'cakes',price:500,img:'img/cakedutchtruffle.jpg',stock:2},
    // Pastries
    {id:12,name:'Dark Chocolate Pastry',type:'pastry',price:150,img:'img/pastrydarkchocolate.jpg',stock:5},
    {id:13,name:'Red Velvet Pastry',type:'pastry',price:120,img:'img/pastryredvelvet.jpg',stock:6},
    {id:14,name:'Pineapple Pastry',type:'pastry',price:100,img:'img/pastrypineapple.jpg',stock:7},
    // Fries
    {id:15,name:'French Fries',type:'fries',price:80,img:'img/frenchfries.jpg',stock:10},
];

let cart = [];

const menuContent = document.getElementById('menu-content');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsDiv = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

function renderItems(filter='all', search=''){
    menuContent.innerHTML='';
    const filtered = items.filter(i => (filter==='all' || i.type===filter) && i.name.toLowerCase().includes(search.toLowerCase()));
    filtered.forEach(item=>{
        const card = document.createElement('div');
        card.className='card';
        card.innerHTML=`
            <img src="${item.img}" alt="${item.name}">
            <div class="card-body">
                <h3>${item.name}</h3>
                <div class="price">₹${item.price}</div>
                <div class="stock">Stock: ${item.stock}</div>
                <button ${item.stock===0?'disabled':''} onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
        menuContent.appendChild(card);
    });
}

function addToCart(id){
    const item = items.find(i=>i.id===id);
    if(item.stock<=0){
        showToast('Out of stock!');
        return;
    }
    const existing = cart.find(c=>c.id===id);
    if(existing){
        if(existing.qty < item.stock) existing.qty++;
        else { showToast('Cannot add more, stock limit reached'); return;}
    }else{
        cart.push({id:item.id,name:item.name,price:item.price,img:item.img,qty:1});
    }
    item.stock--;
    updateCart();
    renderItems();
    showToast(`${item.name} added to cart`);
}

function removeFromCart(id){
    const idx = cart.findIndex(c=>c.id===id);
    if(idx>-1){
        const item = items.find(i=>i.id===id);
        item.stock+=cart[idx].qty;
        cart.splice(idx,1);
        updateCart();
        renderItems();
        showToast(`${item.name} removed from cart`);
    }
}

function updateCart(){
    cartItemsDiv.innerHTML='';
    let total=0;
    cart.forEach(c=>{
        total+=c.price*c.qty;
        const div = document.createElement('div');
        div.className='cart-item';
        div.innerHTML=`
            <img src="${c.img}" alt="${c.name}">
            <h4>${c.name} x${c.qty}</h4>
            <button onclick="removeFromCart(${c.id})">Remove</button>
        `;
        cartItemsDiv.appendChild(div);
    });
    cartTotal.textContent='₹'+total;
    cartCount.textContent=cart.length;
}

function toggleCart(){cartSidebar.classList.toggle('active');}

function checkout(){
    if(cart.length===0){showToast('Cart is empty!');return;}
    cart=[];items.forEach(i=>{});updateCart();showToast('Order placed successfully!');toggleCart();
}

function showToast(msg){
    const toast=document.createElement('div');
    toast.className='toast show';
    toast.textContent=msg;
    document.body.appendChild(toast);
    setTimeout(()=>{toast.remove();},2000);
}

// Filters
document.querySelectorAll('.filter-bar button').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.filter-bar button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        renderItems(btn.dataset.type,document.getElementById('search-input').value);
    });
});

// Search
document.getElementById('search-input').addEventListener('input',(e)=>{
    const active = document.querySelector('.filter-bar button.active').dataset.type;
    renderItems(active,e.target.value);
});

// Contact form
document.getElementById('contact-form').addEventListener('submit',function(e){
    e.preventDefault();
    const msg=document.getElementById('form-message');
    msg.textContent='Message sent successfully!';
    msg.style.opacity=1;
    setTimeout(()=>{msg.style.opacity=0;},3000);
});

// Initial render
renderItems();
