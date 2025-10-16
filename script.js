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
    // Fries (Renamed to Sides in HTML/CSS)
    {id:15,name:'French Fries',type:'fries',price:80,img:'img/frenchfries.jpg',stock:10},
];

let cart = [];

// Cache DOM elements for efficiency
const menuContent = document.getElementById('menu-content');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsDiv = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const searchInput = document.getElementById('search-input');

/**
 * Renders the menu items based on filter and search input.
 * Also handles updating the 'disabled' state based on stock.
 */
function renderItems(filter = 'all', search = ''){
    menuContent.innerHTML = '';
    const filtered = items.filter(i => 
        (filter === 'all' || i.type === filter) && 
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) {
        menuContent.innerHTML = '<p style="text-align: center; width: 100%; color: gray;">No items match your search or filter.</p>';
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const inCartQty = cart.find(c => c.id === item.id)?.qty || 0;
        const availableStock = item.stock;
        const isDisabled = availableStock <= 0;
        
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="card-body">
                <h3>${item.name}</h3>
                <div class="price">₹${item.price}</div>
                <div class="stock">Stock: ${availableStock}</div>
                <button ${isDisabled ? 'disabled' : ''} onclick="addToCart(${item.id})" title="${isDisabled ? 'Out of Stock' : 'Add to Cart'}">
                    ${isDisabled ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        menuContent.appendChild(card);
    });
}

/**
 * Adds an item to the cart and manages stock.
 */
function addToCart(id){
    const item = items.find(i => i.id === id);
    if (!item || item.stock <= 0){
        showToast('Out of stock!');
        return;
    }
    
    const existing = cart.find(c => c.id === id);
    
    if(existing){
        if(existing.qty < item.stock + existing.qty){ // Check against initial stock + current cart qty
             existing.qty++;
        } else { 
            showToast('Cannot add more, stock limit reached'); 
            return;
        }
    } else {
        cart.push({id: item.id, name: item.name, price: item.price, img: item.img, qty: 1});
    }

    item.stock--; // Decrement stock for inventory management
    updateCart();
    // Re-render menu to update stock display and button state
    renderItems(document.querySelector('.filter-bar button.active').dataset.type, searchInput.value); 
    showToast(`${item.name} added to cart`);
}

/**
 * Changes the quantity of an item directly in the cart.
 */
function changeQuantity(id, change){
    const cartItem = cart.find(c => c.id === id);
    const originalItem = items.find(i => i.id === id);
    
    if(!cartItem || !originalItem) return;

    const newQty = cartItem.qty + change;

    if (newQty < 1){
        // If quantity goes below 1, remove the item
        removeFromCart(id);
        showToast(`Reduced quantity or removed ${originalItem.name}.`);
        return;
    }
    
    if (change > 0 && originalItem.stock < change) {
        // Prevent adding more than available stock
        showToast(`Cannot add more. Only ${originalItem.stock} remaining.`);
        return;
    }

    // Update stock and cart quantity
    originalItem.stock -= change;
    cartItem.qty = newQty;

    updateCart();
    renderItems(document.querySelector('.filter-bar button.active').dataset.type, searchInput.value);
}

/**
 * Removes an item completely from the cart.
 */
function removeFromCart(id){
    const idx = cart.findIndex(c => c.id === id);
    if(idx > -1){
        const item = items.find(i => i.id === id);
        // Return quantity back to stock
        item.stock += cart[idx].qty; 
        
        cart.splice(idx, 1);
        updateCart();
        renderItems(document.querySelector('.filter-bar button.active').dataset.type, searchInput.value);
        showToast(`${item.name} removed from cart`);
    }
}

/**
 * Updates the cart sidebar display and total.
 */
function updateCart(){
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; margin-top: 20px; color: gray;">Your cart is empty.</p>';
    }

    cart.forEach(c => {
        total += c.price * c.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${c.img}" alt="${c.name}">
            <h4>${c.name}</h4>
            <div class="quantity-controls">
                <button onclick="changeQuantity(${c.id}, -1)" aria-label="Decrease quantity for ${c.name}">-</button>
                <span class="item-qty">${c.qty}</span>
                <button onclick="changeQuantity(${c.id}, 1)" aria-label="Increase quantity for ${c.name}">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${c.id})">Remove</button>
        `;
        cartItemsDiv.appendChild(div);
    });

    cartTotal.textContent = '₹' + total.toFixed(2);
    cartCount.textContent = cart.length;
}

/**
 * Toggles the visibility of the cart sidebar.
 */
function toggleCart(){
    cartSidebar.classList.toggle('active');
}

/**
 * Completes the order process (Checkout).
 * ERROR FIXED: Removed the unnecessary empty loop.
 */
function checkout(){
    if(cart.length === 0){
        showToast('Cart is empty!');
        return;
    }
    
    // Clear the cart
    cart = [];
    updateCart(); 
    
    // Re-render menu to update stock display and buttons (though stock was updated live)
    renderItems(document.querySelector('.filter-bar button.active').dataset.type, searchInput.value); 
    
    showToast('Order placed successfully! Thank you.');
    toggleCart();
}

/**
 * Displays a non-intrusive notification (Toast).
 */
function showToast(msg){
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    
    // Append to container first
    toastContainer.appendChild(toast); 
    
    // Use requestAnimationFrame for smooth transition trigger
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        // Wait for transition to finish before removal
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); 
}

// --- Event Listeners and Initial Load ---

// Filters
document.querySelectorAll('.filter-bar button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active class
        document.querySelectorAll('.filter-bar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Re-render menu
        renderItems(btn.dataset.type, searchInput.value);
    });
});

// Search
searchInput.addEventListener('input', (e) => {
    const active = document.querySelector('.filter-bar button.active').dataset.type;
    renderItems(active, e.target.value);
});

// Contact form
document.getElementById('contact-form').addEventListener('submit', function(e){
    e.preventDefault();
    
    const msg = document.getElementById('form-message');
    msg.textContent = 'Message sent successfully! We will be in touch soon.';
    msg.style.color = 'var(--color-accent)';
    msg.style.opacity = 1;
    
    this.reset(); // Clear the form
    
    setTimeout(() => {
        msg.style.opacity = 0;
    }, 5000);
});

// Initial render
renderItems();
updateCart(); // Initialize cart display
