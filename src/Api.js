const API_KEY =
  "5b1a4e5c8ecbfca750d5ea7b39fb7d680614a38770d6c090307e5f768a40e6a6";

const GET_COINS_URL =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const ERROR_INDEX = "500";

socket.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );

  if (type === ERROR_INDEX) {
    console.log("ERROR", e.data);
  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => {
    console.log("##FN", fn);
    fn(newPrice);
  });
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

export async function updateCoinsData() {
  try {
    const responseCoins = await fetch(GET_COINS_URL);
    const res = await responseCoins.json();
    return res.Data;
  } catch (error) {
    console.error(error);
  }
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);

  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
