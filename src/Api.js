const API_KEY =
  "5b1a4e5c8ecbfca750d5ea7b39fb7d680614a38770d6c090307e5f768a40e6a6";

//TODO searchParams
export const loadTickers = (tickers) =>
  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
      ","
    )}&api_key=${API_KEY}`
  )
    .catch((error) => console.log(error))
    .then((res) => res.json())
    .then((rowData) =>
      Object.fromEntries(
        Object.entries(rowData).map(([key, value]) => [key, 1 / value])
      )
    );
