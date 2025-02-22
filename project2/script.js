document.addEventListener("DOMContentLoaded", function() {
    const productList = document.getElementById("product-list");

    // `product-list` が存在しない場合のエラーチェック
    if (!productList) {
        console.error("Error: #product-list が見つかりません。");
        return;
    }

    // URLのクエリパラメータを取得する関数
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        const value = urlParams.get(param);
        console.log(`取得したクエリパラメータ [${param}]:`, value);
        return value;
    }

    let currentPage = 1;
    const itemsPerPage = 10; // 1ページあたりの商品数を10に変更

    function loadProducts() {
        productList.innerHTML = ""; // 画面をクリア
        const products = JSON.parse(localStorage.getItem("products")) || [];

        // クエリパラメータから `filterActress` と `filterKeyword` の値を取得
        const filterActress = getQueryParam("filterActress");
        const filterKeyword = getQueryParam("filterKeyword");
        console.log("フィルタリングする女優:", filterActress);
        console.log("フィルタリングするワード:", filterKeyword);

        let filteredProducts = products;

        // 女優でフィルタリング
        if (filterActress && filterActress !== "null") {
            filteredProducts = filteredProducts.filter(product => product.actress && product.actress === filterActress);
        }

        // キーワードでフィルタリング
        if (filterKeyword && filterKeyword !== "null") {
            filteredProducts = filteredProducts.filter(product => 
                product.keywords && product.keywords.includes(filterKeyword)
            );
        }

        // ページネーションの処理
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        // フィルタリング後のデータを表示
        paginatedProducts.forEach(product => {
            const productItem = document.createElement("div");
            productItem.classList.add("work-card");

            let actressHTML = product.actress 
                ? `<button class='actor-button' onclick="filterByActress('${product.actress}')">${product.actress}</button>` 
                : "未設定";

            let keywordsHTML = (product.keywords && product.keywords.length > 0)
                ? product.keywords.map(word => `<button class='keyword-button' onclick="filterByKeyword('${word}')">${word}</button>`).join(" ")
                : "なし";

            // 商品名を30文字まで制限し、それ以上の場合は「...」を追加
            let truncatedName = product.name.length > 30 ? product.name.substring(0, 30) + "..." : product.name;

            productItem.innerHTML = `
                <a href="${product.url}" target="_blank">
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <h3>${truncatedName}</h3>
                </a>
                <p><strong>出演女優:</strong> ${actressHTML}</p>
                <p><strong>関連ワード:</strong> ${keywordsHTML}</p>
            `;
            productList.appendChild(productItem);
        });

        updatePagination(filteredProducts.length);
    }

    function updatePagination(totalItems) {
        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = currentPage * itemsPerPage >= totalItems;
    }

    function changePage(offset) {
        currentPage += offset;
        loadProducts();
    }

    // 女優ボタンをクリックしたときのフィルタリング処理
    window.filterByActress = function(actress) {
        window.location.href = `index.html?filterActress=${encodeURIComponent(actress)}`;
    };

    // キーワードボタンをクリックしたときのフィルタリング処理
    window.filterByKeyword = function(keyword) {
        window.location.href = `index.html?filterKeyword=${encodeURIComponent(keyword)}`;
    };

    loadProducts();

    // ページネーション用のイベントリスナーを追加
    document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPage").addEventListener("click", () => changePage(1));
});
