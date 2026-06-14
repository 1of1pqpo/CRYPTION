const coinMap = {
    btc: "bitcoin",
    eth: "ethereum",
    sol: "solana",
    doge: "dogecoin",
    bnb: "binancecoin",
    xrp: "ripple"
};

const button = document.getElementById("searchBtn");
const input = document.getElementById("coinInput");
const result = document.getElementById("result");
const addPortfolioBtn = document.getElementById("addPortfolioBtn");
const addNoteBtn = document.getElementById("addNoteBtn");

function searchCoin() {

    let coin = input.value.toLowerCase();

    if (coin === "") {

        result.innerHTML =
            "<p>Please enter a coin name or symbol.</p>";

        return;
    }

    if (coinMap[coin]) {
        coin = coinMap[coin];
    }

    getCrypto(coin);
}
button.addEventListener("click", searchCoin);

input.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchCoin();
    }

});

async function getCrypto(coin) {

    try {

        result.innerHTML = ` <p class="loading"> Loading cryptocurrency data...</p>`;

        const url =`https://api.coingecko.com/api/v3/coins/${coin}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Coin not found");
        }

        const data = await response.json();

        const historyResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=21`
        );

        const historyData = await historyResponse.json();

        console.log(historyData);

        const filtered = historyData.prices.filter((item, index) => index % 24 === 0);

        const prices = filtered.map(item => item[1]);

        const n = prices.length;

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (let i = 0; i < n; i++) {

            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumXX += i * i;
        }
       
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const predictedPrice =
        slope * n + intercept;
        console.log(predictedPrice);

        const movingAverage = [];

        for (let i = 0; i < prices.length; i++) {

        if (i < 6) {

        movingAverage.push(null);

    }   else {

        let sum = 0;

        for (let j = i - 6; j <= i; j++) {
            sum += prices[j];
        }

        movingAverage.push(sum / 7);
    }
}

        console.log(prices);

        const labels = filtered.map(item => {
        const date = new Date(item[0]);
        return date.getDate() + "/" + (date.getMonth() + 1);
    });

        const lastDate = new Date(filtered[filtered.length - 1][0]);
            lastDate.setDate(
                lastDate.getDate() + 1
        );

        const nextLabel = lastDate.getDate() + "/" +
            (lastDate.getMonth() + 1);

        labels.push(nextLabel);

        const predictionData =
            new Array(prices.length).fill(null);

        predictionData.push(predictedPrice);

    chart.data.labels = labels;

    chart.data.datasets[0].data =
        [...prices, null];

    chart.data.datasets[1].data =
        [...movingAverage, null];

    chart.data.datasets[2].data =
        predictionData;

    chart.update();

        result.innerHTML = `
            <h2>${data.name}</h2>

            <p>Symbol:
                ${data.symbol.toUpperCase()}
            </p>

            <p>
                Current Price:
                $${data.market_data.current_price.usd}
            </p>

            <p>
                Predicted Next Day:
                $${predictedPrice.toFixed(2)}
            </p>
        `;

    } catch (error) {

        console.error(error);

        document.getElementById("result")
            .innerHTML =
            `<p>Unable to fetch data. Please try again later.</p>`;
    }
}

const ctx = document.getElementById("priceChart");

let chart = new Chart(ctx, {
    type: "line",

    data: {
        labels: [],
        datasets: [
        {
            label: "Price (USD)",
            data: [],
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8
        },
        {
            label: "MA7",
            data: [],
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8
        },
        {
            label: "Prediction",
            data: [],
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8
        }
]
    },

    options: {

    responsive: true,

    plugins: {

        legend: {
            labels: {
                color: "white",
                font: {
                    size: 18
                }
            }
        },

        tooltip: {

            titleFont: {
                size: 18
            },

            bodyFont: {
                size: 16
            }

        },

        zoom: {

            pan: {
                enabled: true,
                mode: "x",
                modifierKey: null
            },

            zoom: {

                wheel: {
                    enabled: true
                },

                pinch: {
                    enabled: true
                },

                mode: "x"
            }

        }

    },

    scales: {

        x: {

            offset: true,

            ticks: {
                color: "white",
                font: {
                    size: 18
                }
            },

            grid: {
                color: "rgba(255,255,255,0.2)"
            }

        },

        y: {

            ticks: {
                color: "white",
                font: {
                    size: 18
                }
            },

            grid: {
                color: "rgba(255,255,255,0.2)"
            }

        }

    }

}

});

addPortfolioBtn.addEventListener("click", () => {

    let coin =
    document.getElementById("portfolioCoin")
    .value
    .toLowerCase();

    if (coinMap[coin]) {
        coin = coinMap[coin];
    }

    const quantity =
        document.getElementById("quantity")
        .value;

    const buyPrice =
        document.getElementById("buyPrice")
        .value;

    const portfolio = {
    coin,
    quantity,
    buyPrice
};

    let portfolios =
        JSON.parse(localStorage.getItem("portfolio")) || [];

    portfolios.push(portfolio);

    localStorage.setItem(
        "portfolio",
        JSON.stringify(portfolios)
    );

    displayPortfolio();

    console.log("Saved!");

});

async function displayPortfolio() {

    const portfolios =
        JSON.parse(localStorage.getItem("portfolio")) || [];

    if (portfolios.length === 0) {

    document.getElementById("portfolioResult")
        .innerHTML =
        "<h3>No Portfolio Added</h3>";

    return;
}

    let html = "<h3>Your Portfolio</h3>";

    for (const portfolio of portfolios) {

        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${portfolio.coin}`
        );

        const data = await response.json();

        const currentPrice =
            data.market_data.current_price.usd;

        const quantity =
            parseFloat(portfolio.quantity);

        const buyPrice =
            parseFloat(portfolio.buyPrice);

        const currentValue =
            quantity * currentPrice;

        const cost =
            quantity * buyPrice;

        const profit =
            currentValue - cost;

        const roi =
            (profit / cost) * 100;

        html += `
            <hr>

            <p><strong>${data.name}</strong></p>

            <p>Quantity: ${quantity}</p>

            <p>Buy Price: $${buyPrice}</p>

            <p>Current Price: $${currentPrice.toFixed(2)}</p>

            <p>Current Value: $${currentValue.toFixed(2)}</p>

            <p>
                Profit/Loss:
                <span style="color:${profit >= 0 ? 'green' : 'red'}">
                    $${profit.toFixed(2)}
                </span>
            </p>

            <p>ROI: ${roi.toFixed(2)}%</p>

            <button onclick="deletePortfolio(${portfolios.indexOf(portfolio)})">
                Delete
            </button>
        `;
    }

        document.getElementById("portfolioResult")
        .innerHTML = html;
}

function deletePortfolio(index) {

    let portfolios =
        JSON.parse(localStorage.getItem("portfolio")) || [];

    portfolios.splice(index, 1);

    localStorage.setItem(
        "portfolio",
        JSON.stringify(portfolios)
    );

    displayPortfolio();
}

displayPortfolio();

addNoteBtn.addEventListener("click", () => {

    const note =
        document.getElementById("noteInput")
        .value;

    if (note === "") return;

    let notes =
        JSON.parse(localStorage.getItem("notes")) || [];

    notes.push(note);

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    displayNotes();

    document.getElementById("noteInput")
        .value = "";
});

function displayNotes() {

    const notes =
        JSON.parse(localStorage.getItem("notes")) || [];

    let html = "<h3>Annotations for Current Chart</h3>";

    notes.forEach((note, index) => {

        html += `
            <div class="annotation-item">

                📌 ${note}

                <button
                    onclick="deleteNote(${index})">
                    Delete
                 </button>

            </div>
`;
});

    document.getElementById("notesContainer")
        .innerHTML = html;
}

function deleteNote(index) {

    let notes =
        JSON.parse(localStorage.getItem("notes")) || [];

    notes.splice(index, 1);

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    displayNotes();
}
displayNotes();