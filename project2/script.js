document.addEventListener("DOMContentLoaded", function() {
    const productList = document.getElementById("product-list");
    const searchBox = document.getElementById("searchBox");
    const searchButton = document.getElementById("searchButton");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    
    const addProductButton = document.getElementById("addProduct");
    const productNameInput = document.getElementById("productName");
    
    if (!productList) {
        console.error("Error: #product-list が見つかりません。");
        return;
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let currentPage = 1;
    const itemsPerPage = 10;

    async function loadProducts() {
        productList.innerHTML = "";
        try {
            const response = await fetch("/.netlify/functions/getProducts");
            const products = await response.json();
            
            if (!Array.isArray(products)) {
                throw new Error("取得したデータが配列ではありません。");
            }

            const filterActress = getQueryParam("filterActress");
            const filterKeyword = getQueryParam("filterKeyword");
            const searchKeyword = getQueryParam("search") || "";
            
            let filteredProducts = products;

            if (filterActress && filterActress !== "null") {
                filteredProducts = filteredProducts.filter(product => product.actress && product.actress === filterActress);
            }

            if (filterKeyword && filterKeyword !== "null") {
                filteredProducts = filteredProducts.filter(product => 
                    product.keywords && product.keywords.includes(filterKeyword)
                );
            }

            if (searchKeyword.trim() !== "") {
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    (product.keywords && product.keywords.some(keyword => keyword.toLowerCase().includes(searchKeyword.toLowerCase())))
                );
            }

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

            paginatedProducts.forEach((product, index) => {
                const productItem = document.createElement("div");
                productItem.classList.add("work-card");

                let actressHTML = product.actress 
                    ? `<button class='actor-button' onclick="filterByActress('${product.actress}')">${product.actress}</button>` 
                    : "未設定";

                let keywordsHTML = (product.keywords && product.keywords.length > 0)
                    ? product.keywords.map(word => `<button class='keyword-button' onclick="filterByKeyword('${word}')">${word}</button>`).join(" ")
                    : "なし";

                let truncatedName = product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name;

                productItem.innerHTML = `
                    <a href="${product.url}" target="_blank">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <h3>${truncatedName}</h3>
                    </a>
                    <p><strong>出演女優:</strong> ${actressHTML}</p>
                    <p><strong>関連ワード:</strong> ${keywordsHTML}</p>
                    <button class='delete-button' onclick="removeProduct(${index})">削除</button>
                `;
                productList.appendChild(productItem);
            });

            updatePagination(filteredProducts.length);
        } catch (error) {
            console.error("Firestore のデータ取得エラー:", error);
        }
    }

    if (addProductButton) {
        addProductButton.addEventListener("click", async function () {
            const productName = productNameInput.value.trim();
            if (!productName) return;

            const productData = {
                name: productName,
                url: "#",
                imageUrl: "default.jpg",
                actress: "",
                keywords: []
            };

            try {
                const response = await fetch("/.netlify/functions/addProduct", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                });
                const result = await response.json();
                console.log("Product added:", result);
                loadProducts();
            } catch (error) {
                console.error("Product追加エラー:", error);
            }
        });
    }

    window.removeProduct = async function(index) {
        try {
            const response = await fetch("/.netlify/functions/deleteProduct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index })
            });
            const result = await response.json();
            console.log("Product deleted:", result);
            loadProducts();
        } catch (error) {
            console.error("Product削除エラー:", error);
        }
    };

    loadProducts();
    prevPageBtn.addEventListener("click", () => changePage(-1));
    nextPageBtn.addEventListener("click", () => changePage(1));
});
