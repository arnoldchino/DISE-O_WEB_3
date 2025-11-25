class Producto {
    constructor(id, name, price, image, isDigital = false) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.isDigital = isDigital;
    }

    getPrecioConIGV() {
        return this.price * 1.18;
    }
    
    calcularCostoEnvio() {
        return 15; 
    }
}

class ArticuloDigital extends Producto {
    constructor(id, name, price, image) {
        super(id, name, price, image, true);
    }
    
    calcularCostoEnvio() {
        return 0; 
    }
}

const productosDisponibles = new Map([
    [1, new Producto(1, 'iPhone 14 Pro', 4999, 'img/cel2.jpg')],
    [2, new Producto(2, 'Samsung S23 Ultra', 4599, 'img/cel3.webp')],
    [3, new ArticuloDigital(3, 'Funda Exclusiva (Digital)', 50, 'img/funda.jpg')], 
    [4, new Producto(4, 'Xiaomi 13 Pro', 2999, 'img/cel4.jpg')],
    [5, new Producto(5, 'IPHONE S24', 4800, 'img/cel3.webp')]
]);

let cartData = JSON.parse(localStorage.getItem('cart') || '[]');
let cart = cartData.map(item => {
    if (item.isDigital) {
        return new ArticuloDigital(item.id, item.name, item.price, item.image);
    }
    return new Producto(item.id, item.name, item.price, item.image);
});


function crearCalculadoraIVA(tasa) {
    return (subtotal) => subtotal * tasa; 
}
const calcularSoloIVA = crearCalculadoraIVA(0.18);


function calcularMontoConDescuentoRecursivo(monto, nivelDescuento) {
    if (nivelDescuento <= 0) {
        return monto;
    }
    return calcularMontoConDescuentoRecursivo(monto * 0.95, nivelDescuento - 1); 
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');
    if (!cartItemsContainer || !totalElement) return;

    cartItemsContainer.innerHTML = '';
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

    const costoEnvioTotal = cart.reduce((sum, item) => sum + item.calcularCostoEnvio(), 0);
    
    const ivaMonto = calcularSoloIVA(subtotal);
    
    const totalFinal = subtotal + ivaMonto + costoEnvioTotal;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        
        li.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto;"> ${item.name} - S/. ${item.price.toFixed(2)} (Envío: S/. ${item.calcularCostoEnvio().toFixed(2)})`;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Eliminar';
        removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn');
        removeButton.dataset.index = index; 
        
        li.appendChild(removeButton);
        cartItemsContainer.appendChild(li);
    });

    totalElement.innerHTML = `
        <hr>
        <p>Subtotal: S/. ${subtotal.toFixed(2)}</p>
        <p>IGV (18%): S/. ${ivaMonto.toFixed(2)}</p>
        <p>Costo de Envío: S/. ${costoEnvioTotal.toFixed(2)}</p>
        <h4 class="text-primary">Total Final: S/. ${totalFinal.toFixed(2)}</h4>
    `;

    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = productosDisponibles.get(productId);
    if (product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} ha sido agregado al carrito.`);
        if (document.getElementById('cart-items')) {
            updateCart();
        }
    } else {
        alert('Error: Producto no encontrado.');
    }
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCart();
    }
}

function checkout() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const costoEnvioTotal = cart.reduce((sum, item) => sum + item.calcularCostoEnvio(), 0);
    const ivaMonto = calcularSoloIVA(subtotal);
    const totalFinal = subtotal + ivaMonto + costoEnvioTotal;
    
    alert(`Procesando compra de S/. ${totalFinal.toFixed(2)}...`);
    setTimeout(() => {
        alert('¡Compra finalizada con éxito! Gracias por tu preferencia.');
        cart = [];
        updateCart();
        localStorage.removeItem('cart');
    }, 1500); 
}

function searchProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const products = document.querySelectorAll('.product-item');
    products.forEach(product => {
        const title = product.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function registerUser(event) {
    event.preventDefault(); 

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden. Por favor, revísalas.");
        return false;
    }

    const username = document.getElementById('username').value;
    alert('¡Registro exitoso! Bienvenido, ' + username + '!');
    
    return true; 
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-items')) {
        updateCart();
    }

    const cartList = document.getElementById('cart-items');
    if (cartList) {
        cartList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-btn')) {
                const index = event.target.dataset.index;
                removeFromCart(parseInt(index));
            }
        });
    }

    const checkoutButton = document.querySelector('#cart button');
    if (checkoutButton && checkoutButton.textContent.includes('Finalizar Compra')) {
        checkoutButton.addEventListener('click', checkout);
    }
    
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
        });
        input.addEventListener('blur', () => {
            input.style.boxShadow = 'none';
        });
    });

    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchProducts);
    }
    
    const registerForm = document.getElementById('registro-form');
    if (registerForm) {
        registerForm.addEventListener('submit', registerUser);
    }
    
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.backgroundColor = 'rgba(0, 123, 255, 0.9)'; 
            } else {
                nav.style.backgroundColor = '#007bff';
            }
        }
    });
});