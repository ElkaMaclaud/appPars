const puppeteer = require('puppeteer');
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function fetchProducts(categoryUrl) {
  // Запускаем Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Переходим на страницу категории
  await page.goto(categoryUrl, { waitUntil: 'networkidle2' });

  // Получаем куки
  const cookies = await page.cookies();
  const cookieJar = new CookieJar();
  cookies.forEach(cookie => {
    cookieJar.setCookieSync(`${cookie.name}=${cookie.value}`, categoryUrl);
  });

  const headers = await page.evaluate(() => {
    return {
      'User-Agent': navigator.userAgent,
      'Accept': 'application/json',
      'Accept-Language': navigator.language,
      // Добавьте другие заголовки, если необходимо
    };
  });

  await browser.close();

  // Создаем Axios клиент с куками
  const client = wrapper(axios.create({ jar: cookieJar }));

  try {
    // Выполняем API-запрос для получения данных о товарах
    const apiResponse = await client.get('URL_ВАШЕГО_API', {
      headers: {
        ...headers,
        // Добавьте другие заголовки, если необходимо
      },
    });

    // Обработка данных о товарах
    const products = apiResponse.data; // Предполагается, что данные о товарах находятся в этом поле
    console.log(products);

    // Сохранение данных в файл
    const fs = require('fs');
    const output = products.map(product => {
      return `Название товара: ${product.name}\nСсылка на изображение: ${product.image}\nРейтинг: ${product.rating}\nКоличество отзывов: ${product.reviewCount}\nЦена: ${product.price}\nАкционная цена: ${product.salePrice || 'Нет'}\nЦена до акции: ${product.oldPrice || 'Нет'}\nРазмер скидки: ${product.discount || 'Нет'}\n\n`;
    }).join('');

    fs.writeFileSync('products-api.txt', output);
    console.log('Данные о товарах сохранены в products-api.txt');
  } catch (error) {
    console.error('Ошибка при выполнении API-запроса:', error.message);
  }
}

// Вызов функции с нужным URL
fetchProducts('https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory');



















const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const vm = require('vm');
const { JSDOM } = require('jsdom');

async function fetchProducts(categoryUrl) {
  let cookies = ""; // Хранилище для куков
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, timeout: 10000 }));
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  try {
    // 1. Первый запрос: Получаем 503 и challenge_url
    const firstResponse = await client.get("https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      validateStatus: (status) => status === 503, // Обрабатываем только статус 503
    });

    console.log("Первый запрос: статус 503, куки сохранены в CookieJar");

    // Получаем URL для JavaScript-челленджа из challenge_url
    const challengeUrl = firstResponse.headers["set-cookie"]
      .find((cookie) => cookie.includes("challenge_url"))
      .match(/challenge_url=([^&]+)/)[1];
    const challengeFullUrl = `https://www.vprok.ru${decodeURIComponent(challengeUrl)}`;
    console.log("URL для JavaScript-челленджа:", challengeFullUrl);

    console.log("URL для JavaScript-челленджа:", challengeFullUrl);

    // Извлекаем challenge_signature
    const challengeSignature = firstResponse.headers["set-cookie"]
      .find((cookie) => cookie.includes("challenge_signature"))
      .match(/challenge_signature=([^&;]+)/)[1];
    console.log("Подпись челленджа (challenge_signature):", challengeSignature);

    // Извлекаем challenge_complexity
    const challengeComplexity = firstResponse.headers["set-cookie"]
      .find((cookie) => cookie.includes("challenge_complexity"))
      .match(/challenge_complexity=([^&;]+)/)[1];
    console.log("Сложность челленджа (challenge_complexity):", challengeComplexity);



    // 2. Второй запрос: Запрос JavaScript-файла
    const jsFileUrl = "https://www.vprok.ru/js-challenge-script-99c5399535c92c38ab40475540a05465.js?v=071cc3d9c49958aa0af6";
    const jsFileResponse = await client.get(jsFileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        Referer: "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"
      },
    });

    const scriptContent = jsFileResponse.data;

    const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
      url: "https://www.vprok.ru",
      referrer: "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory",
      contentType: "text/html",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      includeNodeLocations: true,
      pretendToBeVisual: true,
    });

    // Создаем контекст для выполнения скрипта
    const context = {
      window: dom.window,
      document: dom.window.document,
      navigator: {
        languages: ["ru-RU", "en-US"],
        cookieEnabled: true,
        vendor: "Google Inc.",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      },
      location: dom.window.location,
      console: console,
      challenge_signature: challengeSignature,
      challenge_complexity: challengeComplexity,
    };

    // Добавляем объекты из jsdom в глобальный контекст
    vm.createContext(context);

    // Оборачиваем выполнение скрипта в асинхронную функцию
    const modifiedScriptContent = `
      (async () => {
        ${scriptContent}
        // Ждем завершения асинхронных операций, если они есть
        await delay(5000); // Ждем 5 секунд
        console.log("Отладка: решение =", solution);
      })();
    `;

    // Выполняем скрипт
    vm.runInContext(modifiedScriptContent, context);

    // Проверяем значение solution
    const solution = context.window.solution || context.solution;
    console.log("Решение челленджа (solution):", solution);

    // 3. Третий запрос: Выполнение JavaScript-челленджа
    const postBody = {
      solution: 99,
      osCpu: undefined,
      colorDepth: 24,
      deviceMemory: 8,
      hardwareConcurrency: 6,
      openDatabase: false,
      cpuClass: undefined,
      plugins: 5,
      vendor: "Google Inc.",
      __nightmare: undefined,
      callPhantom: undefined,
      _phantom: undefined,
      phantom: undefined,
      webdriver: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      window_buffer: false,
      window_coach: false,
      rhino: false,
      msDontr: undefined,
      navDontr: null,
      language: "ru-RU",
      languages: "ru-RU,ru,en-US,en",
      screen_width: 1920,
      screen_availWidth: 1920,
      screen_height: 1080,
      screen_availHeight: 1080,
      hasLiedOs: false,
      hasLiedBrowser: false,
      clipboard: true,
      getBattery: true,
      locationBar: true,
      mozInnerScreenX: false,
      mozInnerScreenY: false,
      domAutomation: false,
      domAutomationController: false,
      topself: true,
      hasFocus: true,
      navType: 1,
      window_webdriver: undefined,
      window__Selenium_IDE_Recorder: undefined,
      window_callSelenium: undefined,
      window__selenium: undefined,
      document___webdriver_script_fn: undefined,
      document___driver_evaluate: undefined,
      document___webdriver_evaluate: undefined,
      document___selenium_evaluate: undefined,
      document___fxdriver_evaluate: undefined,
      document___driver_unwrapped: undefined,
      document___webdriver_unwrapped: undefined,
      document___selenium_unwrapped: undefined,
      document___fxdriver_unwrapped: undefined,
      document___webdriver_script_func: undefined,
      document_attribute_selenium: null,
      document_attribute_webdriver: null,
      document_attribute_driver: null,
      fonts: "Arial,Arial Black,Arial Narrow,Calibri,Cambria,Cambria Math,Comic Sans MS,Consolas,Courier,Courier New,Georgia,Helvetica,Impact,Lucida Console,Lucida Sans Unicode,Microsoft Sans Serif,MS Gothic,MS PGothic,MS Sans Serif,MS Serif,Palatino Linotype,Segoe Print,Segoe Script,Segoe UI,Segoe UI Light,Segoe UI Semibold,Segoe UI Symbol,Tahoma,Times,Times New Roman,Trebuchet MS,Verdana,Wingdings",
      hasAdBlock: false,
      platform: "Win32",
      sessionStorage: true,
      localStorage: true,
      indexedDB: true,
      maxTouchPoints: 0,
      touchEvent: false,
      touchStart: false,
      vendorFlavors: "chrome",
      cookiesEnabled: true,
      colorGamut: "srgb",
      invertedColors: undefined,
      forcedColors: undefined,
      monochrome: 0,
      contrast: undefined,
      missing_image_size_width: 0,
      missing_image_size_height: 957,
      timezoneOffset: -180,
      timezone: "Europe/Moscow",
      datetimeNow: Date.now(),
    };

    const challengeResponse = await client.post(challengeFullUrl, postBody, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Length": 2852,
        Referer: "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory",
        Host: "www.vprok.ru",
        Origin: "https://www.vprok.ru",
        Pragma: "no-cache",
        "sec-ch-ua": "Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
    });

    if (challengeResponse.headers["set-cookie"]) {
      cookies += "; " + thirdResponse.headers["set-cookie"].map((cookie) => cookie.split(";")[0]).join("; ");
    }
    console.log("Куки после третьего запроса:", cookies);
    console.log("Третий запрос: JavaScript-челлендж выполнен, куки обновлены", challengeResponse.status);

    // 4. Третий запрос (финальный для JavaScript-челленджа)
    const thirdResponse = await axios.get(categoryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
    });

    // Сохраняем куки из третьего ответа
    if (thirdResponse.headers["set-cookie"]) {
      cookies += "; " + thirdResponse.headers["set-cookie"].map((cookie) => cookie.split(";")[0]).join("; ");
    }
    console.log("Куки после третьего запроса:", cookies);

    // 5. Четвертый запрос (получаем редирект 307)
    const fourthResponse = await axios.get(categoryUrl, {
      maxRedirects: 0, // Отключаем автоматический редирект
      validateStatus: (status) => status === 307, // Обрабатываем только статус 307
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
    });

    // Получаем URL для редиректа
    const firstRedirectUrl = fourthResponse.headers.location;
    console.log("Первый редирект на URL:", firstRedirectUrl);

    // Сохраняем куки из четвертого ответа
    if (fourthResponse.headers["set-cookie"]) {
      cookies += "; " + fourthResponse.headers["set-cookie"].map((cookie) => cookie.split(";")[0]).join("; ");
    }
    console.log("Куки после четвертого запроса:", cookies);

    // 6. Пятый запрос (промежуточный)
    const fifthResponse = await axios.get(firstRedirectUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
    });

    console.log("Ответ промежуточного запроса:", fifthResponse.data);

    // Сохраняем куки из пятого ответа
    if (fifthResponse.headers["set-cookie"]) {
      cookies += "; " + fifthResponse.headers["set-cookie"].map((cookie) => cookie.split(";")[0]).join("; ");
    }
    console.log("Куки после пятого запроса:", cookies);

    // 6. Шестой запрос (финальный)
    const finalResponse = await axios.get(categoryUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        Cookie: cookies, // Передаем все собранные куки
      },
    });

    const html = finalResponse.data;

    console.log(html)
    // Находим JSON-данные внутри <script id="__NEXT_DATA__">
    const startIndex = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
    const endIndex = html.indexOf("</script>", startIndex);

    if (startIndex === -1 || endIndex === -1) {
      console.error("Не удалось найти данные в теге <script id='__NEXT_DATA__'>.");
    }

    const jsonScript = html.substring(
      startIndex + '<script id="__NEXT_DATA__" type="application/json">'.length,
      endIndex
    );

    const jsonData = JSON.parse(jsonScript);

    const products = jsonData.props.pageProps.initialData.products || [];
    console.log(`Найдено товаров: ${products.length}`);
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

    fs.writeFileSync("products-api.txt", formattedProducts.join("\n"), "utf-8");
    console.log("Данные успешно сохранены в файл products-api.txt");
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error.message);
  }
}

const categoryUrl = process.argv.slice(2)[0];
if (!categoryUrl) {
  console.error("Необходимо указать URL.");
  process.exit(1);
}
//const categoryUrl = "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory";
fetchProducts(categoryUrl);








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

    console.log('Cookies:', cookieString);

    // Используем куки для выполнения запроса через axios
    const response = await axios.get('https://www.vprok.ru/catalog/1301/ovoschi-frukty-griby', {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Host": "www.vprok.ru",
        "Pragma": "no-cache",
        "Referer": "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory",
        "Sec-CH-UA": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        'Cookie': cookieString, 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
    });

    const html = response.data;

    console.log('HTML успешно получен.');

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

    await browser.close();
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error.message);
  }
})();


ngx_s_id=OTMyNDM4NGUtYzZhNC00MzA0LThmZjAtOGZiODdiNTZkMWQ0QDE3Mzk5MTE3MDQzNzlAOTAwMDAwQDE3Mzk5MTE3MDQzNzlAZDliY2QzZTE0NzJlY2Y3ZmVlOGVkZWEzMmU1YTc3NWYzMmQwYmM0MDcyMTMzNzhmYmYwNGMwZWY3NDY3MTJhNQ==; _ga_8DT66WKR7C=GS1.1.1739911200.1.1.1739911703.60.0.0; _ga_GK2L3NTRC5=GS1.1.1739911202.1.1.1739911703.60.0.0; ngenix_jscv_9c7b371f0f1d=cookie_expires=1739998104&bot_profile_check=true&cookie_signature=P6ixAxkThHDwUJlaVpkmSlbO%2Fc0%3D; 
luuid=1346efe5-31dd-4cf6-b7e9-1863b41380ef; suuid=98cc3206-2796-401d-8bf5-9300c735edbb; 
access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5IiwianRpIjoidXVpZDEzNDZlZmU1LTMxZGQtNGNmNi1iN2U5LTE4NjNiNDEzODBlZjVhM2Q3MDk5MTBjMGM5N2ExOWU5Y2Q0NjYwNDg3NTViNmQ0NGM3NTkiLCJpYXQiOjE3Mzk5MTE3MDYuNTY5MTI5LCJuYmYiOjE3Mzk5MTE3MDYuNTY5MTMzLCJleHAiOjE3Mzk5OTgxMDYuNTYyOTY3LCJzdWIiOiIiLCJzY29wZXMiOltdLCJzcGxpdF9zZWdtZW50Ijo0LCJ4NWlkX2FjY2Vzc190b2tlbiI6IiIsImN1c3RvbWVyX3V1aWQiOiIifQ.ieHp_3FNyhzfmuPZe4aAHn8_1TFKhLY_BbuOPFJ4YDeK3l9NUUZqiNS3Duidn7wWFn0IHZRtmNFvrj5kr5laH43rcgYavWzBJj3kad227vwwVNyGn0ymdvZqp_h32yj23m7EwbqnKjKpDYgteK0babiItyFM00ZWx2CcPm1b9-7hRn0QYYnMUWVoy5eOV4X7dbdFtsGo1Th6DMsWYvsJHyRpgO9CnWMtVxX5oI4ySkwb-IfBzbbVzqTzpyVqUaQredLx40qFSPFWGCKyxfRE8uiNGDUo8QtutAkgo8qA7AHctFrpH9vXVdOLdFEE6kwZRgU0fclv8TZOedv1UANvJEv8LJUYTL2xU34UwIwEQGmOmRCI0Aqdic09AcE0UMATlHiMVCCKDBcuSLweNTSJrOG7kY9J4srsTUXyt9-pJNwEx9f0dAXE4Nyeq1NRq4cxzPzb1gerYq-O39iEpImiPii09DXyiJ8j76z5Ibnry78G7qpaktLwxZWWZ3T9nAh6I3X11gYcxXSLYYM-OfeJelrbl7BP5mLxwD5UdJp1Fr5zwBnRKA7OYCQas13pXgsRxani614m-hOXurDCvoog4JfQY5CvbjIY9UBYj8Z1SH6o50RIyqrDOjvSQwx1kl-X90nToltC9rbTI1qgn9IUE2Hxw9rYiRaNIPvvtXmcDF8; split_segment=4; split_segment_amount=11; region=1; pickupAvailable=0; _POBP_s=rum=1&id=f3c454a1-d0b5-41a7-af99-31dad6293f32&created=1739911708494&expire=1739912608494; 
encryptedSessionId=944be63133f90090391ee2b530440ae80af8b72e3e3ac796bb32c0faf28a8089; deliveryTypeId=1; shop=2527; standardShopId=2527; 



XSRF-TOKEN=eyJpdiI6IkF0cE5RaFwvQm84WE5QbzNkTkVMa0RBPT0iLCJ2YWx1ZSI6IlExRVkySTZ4c05RN2V5Q0lmc2laeHV4MGs4NHladk4yWVNhdVU3b2RRQyttcEtNaFd6SmpIc3dHbUp4b2wyZmVuRFFYZGdvOU1YUFh1VFkzN25mRkd3PT0iLCJtYWMiOiIxN2YxZmY1M2JmMjZhZWFmMGI0NDhiODBiM2I2YTEyZDJmNTQ4MjliZTM3N2NjMjMyNmQ4MTE3NzcyOWZlOTcwIn0%3D; aid=eyJpdiI6InI4T2dpb2VLOG83dGxpZzBaRVoxdFE9PSIsInZhbHVlIjoiZzRoNHlCTk9tR0xKZ2l0KzZWdVREbFphYTlaakJiK3FmNHNmcTVCZFlickNxYm1QRGRSWVZQbEZ0NDB5aTc4aVJyT2NPWVVkcEVJZmtESEY0cmZHTWc9PSIsIm1hYyI6IjFlYzU1NjdlN2U0ZGQxNDM5NjIzOWVkMzFiNjMzNjY4ZWNhMjg1NTI5MWYwMzg4NWRjMjZjNmY2ODJiYmMyNDIifQ%3D%3D