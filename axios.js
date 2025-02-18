const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false }); // Запускаем браузер в headless-режиме
    const page = await browser.newPage();

    // Устанавливаем User-Agent и другие заголовки
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    // Переходим на страницу, где выполняется JavaScript-челлендж
    await page.goto('https://www.vprok.ru/catalog/1301/ovoschi-frukty-griby', {
      waitUntil: 'networkidle2', // Ждем, пока загрузятся все ресурсы
    });
    await page.setViewport({ width: 1280, height: 1024 });

    // Ждем выполнения JavaScript-челленджа
    await new Promise((resolve) => setTimeout(resolve,10000));// Можно настроить время ожидания

    // Получаем куки после прохождения проверки
    const cookies = await page.cookies();
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const xsrfTokenCookie = cookies.find(cookie => cookie.name === 'XSRF-TOKEN');
    const xsrfToken = xsrfTokenCookie ? xsrfTokenCookie.value : null;

    // console.log('Cookies:', cookieString);
    console.log("X-XSRF-TOKEN:", xsrfToken);

    // Используем куки для выполнения запроса через axios
    const response = await axios.get('https://www.vprok.ru/web/api/v1/catalog/category/1301?sort=popularity_desc&limit=30&page=1', {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Content-Length": 62,
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "www.vprok.ru",
        "Origin": "https://www.vprok.ru",
        "Referer": "https://www.vprok.ru/catalog/1301/ovoschi-frukty-griby",
        "Upgrade-Insecure-Requests": "1",
        'Cookie': cookieString, 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.366",
        "X-Xsrf-Token":  xsrfToken,

      },
    });

    const html = response.data;

    // console.log('HTML успешно получен.');

    // Находим JSON-данные внутри <script id="__NEXT_DATA__">
    const startIndex = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
    const endIndex = html.indexOf("</script>", startIndex);

    if (startIndex === -1 || endIndex === -1) {
      console.error("Не удалось найти данные в теге <script id='__NEXT_DATA__'>.");
      return;
    }

    const jsonScript = html.substring(
      startIndex + '<script id="__NEXT_DATA__" type="application/json">'.length,
      endIndex
    );

    const jsonData = JSON.parse(jsonScript);

    // Извлекаем данные о продуктах
    const products = jsonData.props.pageProps.initialData.products || [];
    console.log(`Найдено товаров: ${products.length}`);

    // Форматируем данные о продуктах
    const formattedProducts = products.map((product) => {
      return `Название товара: ${product.name}
              Ссылка на изображение: ${product.images[0]?.url || "Нет данных"}
              Рейтинг: ${product.rating || "Нет данных"}
              Количество отзывов: ${product.reviews || "Нет данных"}
              Цена: ${product.price || "Нет данных"}
              Акционная цена: ${product.discountPrice || "Нет данных"}
              Цена до акции: ${product.oldPrice || "Нет данных"}
              Размер скидки: ${product.discount || "Нет данных"}\n`;
    });

    // Сохраняем данные в файл
    fs.writeFileSync("products-api.txt", formattedProducts.join("\n"), "utf-8");
    console.log("Данные успешно сохранены в файл products-api.txt");

    // await browser.close();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error.message);
  }
})();