let map;
let allMarkers = [];
let currentFilter = null;

/* ---------------- 类型 & 颜色 ---------------- */
const typeColorMap = {
    "主题乐园与休闲度假区|Theme Park & Resort": "#FF5733",
    "古镇老街与历史街区|Ancient Town & Historic Street": "#33C3FF",
    "地标建筑与城市观光|Landmark & City Sightseeing": "#33FF57",
    "自然生态与城市公园|Nature & City Park": "#FFC300",
    "博物馆与文化艺术|Museum & Cultural Art": "#FF33A8",
    "特色商圈与美食街区|Shopping & Food Street": "#8E44AD",
    "宗教与民俗特色场馆|Religious & Folk Venue": "#1ABC9C",
    "文化遗址与红色地标|Cultural & Red Landmark": "#E67E22",
    "其他|Other": "#888888"
};

/* ---------------- 过滤 ---------------- */
function filterByType(type) {
    currentFilter = type;

    allMarkers.forEach(marker => {
        (!type || marker._type === type) ? marker.show() : marker.hide();
    });

    updateLegendActive(type);
}

/* ---------------- 图例 ---------------- */
function renderLegend() {
    const content = document.getElementById("legend-content");
    content.innerHTML = "";

    // 显示全部
    const allItem = createLegendItem("🌏 显示全部", null, null);
    content.appendChild(allItem);

    Object.entries(typeColorMap).forEach(([type, color]) => {
        const [ch, en] = type.split("|");
        const item = createLegendItem(`${ch} (${en})`, type, color);
        content.appendChild(item);
    });

    // 折叠
    document.getElementById("legend-header").onclick = () => {
        content.classList.toggle("collapsed");
        document.getElementById("legend-toggle").textContent =
            content.classList.contains("collapsed") ? "▸" : "▾";
    };
}

function createLegendItem(text, type, color) {
    const div = document.createElement("div");
    div.className = "legend-item";

    if (color) {
        const box = document.createElement("span");
        box.className = "color-box";
        box.style.background = color;
        div.appendChild(box);
    }

    const label = document.createElement("span");
    label.textContent = text;
    div.appendChild(label);

    div.onclick = () => filterByType(type);
    div.dataset.type = type;

    return div;
}

function updateLegendActive(type) {
    document.querySelectorAll(".legend-item").forEach(el => {
        el.classList.toggle("active", el.dataset.type === type);
    });
}

/* ---------------- 水滴图标 ---------------- */
function createWaterDropIcon(color) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <path d="
            M16 30
            C21 23 26 19 26 13
            C26 7 21.5 2 16 2
            C10.5 2 6 7 6 13
            C6 19 11 23 16 30
            Z"
            fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="13" r="4" fill="white"/>
    </svg>`;

    return new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: "data:image/svg+xml;base64," +
               btoa(unescape(encodeURIComponent(svg))),
        imageSize: new AMap.Size(32, 32)
    });
}



/* ---------------- 修复关键问题：字段名不一致 ---------------- */
function addMarker(lnglat, attraction, color) {
    const marker = new AMap.Marker({
        position: lnglat,
        map,
        title: attraction['名称'] || '',  // 修复：改为 '名称'，不要 '|Name'
        offset: new AMap.Pixel(0, -28),
        icon: createWaterDropIcon(color)
    });

    // 修复关键：这里要用 '类型'，而不是 '类型|Type'，确保和过滤逻辑一致
    marker._type = attraction['类型'] || '其他|Other';
    marker._attraction = attraction; 
    allMarkers.push(marker);

    const infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -36),
        content: `
        <div class="info-content">
            <h3>${attraction['名称'] || '暂无｜None'}</h3>

            <div class="info-row">
                <span class="icon icon-score"></span>
                <p>评分｜Score：<strong class="score">${attraction['评分'] || '暂无｜None'}</strong></p>
            </div>

            <div class="info-row">
                <span class="icon icon-address"></span>
                <p>地址｜Address：${attraction['地址'] || '暂无｜None'}</p>
            </div>

            ${attraction['电话'] ? `
            <div class="info-row">
                <span class="icon icon-phone"></span>
                <p>电话｜Tel：${attraction['电话']}</p>
            </div>` : `
            <div class="info-row">
                <span class="icon icon-phone"></span>
                <p>电话｜Tel：暂无｜None</p>
            </div>`}

            ${attraction['官网'] ? `
            <div class="info-row">
                <span class="icon icon-website"></span>
                <p>官网｜Website：<a href="${attraction['官网']}" target="_blank">访问｜Visit</a></p>
            </div>` : `
            <div class="info-row">
                <span class="icon icon-website"></span>
                <p>官网｜Website：暂无｜None</p>
            </div>`}

            <div class="info-row">
                <span class="icon icon-time"></span>
                <p>开放时间｜Open time：${attraction['开放时间'] || '暂无｜None'}</p>
            </div>

            <div class="info-row">
                <span class="icon icon-playtime"></span>
                <p>建议游玩时间｜Suggested visiting time：${attraction['建议游玩时间'] || '暂无｜None'}</p>
            </div>

            <div class="info-row">
                <span class="icon icon-ticket"></span>
                <p>门票｜Ticket：${attraction['门票'] || '免费｜Free'}</p>
            </div>

            ${attraction['链接'] ? `
            <div class="info-row">
                <span class="icon icon-link"></span>
                <p><a href="${attraction['链接']}" target="_blank">原始详情｜Qunar Details</a></p>
            </div>` : `
            <div class="info-row">
                <span class="icon icon-link"></span>
                <p>原始详情｜Qunar Details：暂无｜None</p>
            </div>`}
        </div>`
    });

    marker.on('click', () => infoWindow.open(map, lnglat));
}

/* ---------------- 数据 ---------------- */
function loadAttractions() {
    fetch("./attractions.json")
        .then(res => res.json())
        .then(data => {
            data.forEach(a => {
                if (!a.lng || !a.lat) return;
                const type = a["类型"] in typeColorMap ? a["类型"] : "其他|Other";
                addMarker([a.lng, a.lat], a, typeColorMap[type]);
            });
        });
}

/* ---------------- 初始化 ---------------- */
window.onload = () => {
    map = new AMap.Map("mapContainer", {
        zoom: 12,
        center: [121.4737, 31.2304],
        viewMode: "3D"
    });

    renderLegend();
    loadAttractions();

    /* ---------------- 搜索功能 ---------------- */
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");

    function filterBySearch(query) {
        const q = query.trim().toLowerCase();
        allMarkers.forEach(marker => {
            const name = (marker._attraction['名称|Name'] || marker._attraction['名称'] || '').toLowerCase();
            const typeMatch = !currentFilter || marker._type === currentFilter;
            const nameMatch = !q || name.includes(q);

            (typeMatch && nameMatch) ? marker.show() : marker.hide();
        });
    }

    searchInput.addEventListener("input", () => {
        filterBySearch(searchInput.value);
    });

    searchClear.addEventListener("click", () => {
        searchInput.value = "";
        filterBySearch("");
    });
};



