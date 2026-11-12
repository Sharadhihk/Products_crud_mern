
const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const productId = document.getElementById("productId");
const submitBtn = document.getElementById("submitBtn");

const API = "/api/products";

// Display products
async function loadProducts() {
    try {
        const res = await fetch(API);

        if (!res.ok) throw new Error("Failed to load products");

        const products = await res.json();

        productList.innerHTML = "";

        if (products.length === 0) {
            productList.innerHTML =
                `<tr><td colspan="4">No products found</td></tr>`;
            return;
        }

        products.forEach((p, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHTML(p.name)}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>
                    <button class="edit"
                        onclick="editProduct('${p._id}')">
                        Edit
                    </button>

                    <button class="delete"
                        onclick="deleteProduct('${p._id}')">
                        Delete
                    </button>
                </td>
            `;

            productList.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        productList.innerHTML =
            `<tr><td colspan="4">Unable to load products</td></tr>`;
    }
}

// Safely display product names
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// Add or update product
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || priceInput.value === "" ||
        !Number.isFinite(price) || price < 0) {
        alert("Enter valid product details");
        return;
    }

    const id = productId.value;

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, price })
        });

        if (!res.ok) throw new Error("Operation failed");

        form.reset();
        productId.value = "";
        submitBtn.textContent = "Submit";

        loadProducts();

    } catch (error) {
        alert("Unable to save product");
        console.error(error);
    }
});

// Edit product
async function editProduct(id) {
    try {
        const res = await fetch(API);
        const products = await res.json();

        const product = products.find(p => p._id === id);

        if (!product) return;

        productId.value = product._id;
        nameInput.value = product.name;
        priceInput.value = product.price;

        submitBtn.textContent = "Update";

        nameInput.focus();

    } catch (error) {
        alert("Unable to edit product");
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm("Do you want to delete this product?"))
        return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");

        loadProducts();

    } catch (error) {
        alert("Unable to delete product");
    }
}

// Load products on page opening
loadProducts();
