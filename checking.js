const axios = require("axios");

async function fetchData(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cookie": "key1=value1; key2=value2", 
      },
    });

    console.log("Статус ответа:", response.status);
    console.log("Тело ответа:", response.data);
  } catch (error) {
    console.error("Ошибка при запросе:", error.message);
  }
}

fetchData("https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory");