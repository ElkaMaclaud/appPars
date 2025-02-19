const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeProduct(loadingTime, url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    });

    try {
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: loadingTime,
        });
        await page.setViewport({ width: 1280, height: 1024 });

        const urlForApi = url.match(/(\/catalog\/[0-9]+\/[^\/\?]+)/)?.[1];
        const categoryId = url.match(/\/catalog\/([0-9]+)/)?.[1];

        if (!urlForApi || !categoryId) {
            throw new Error("Не удалось извлечь данные из URL. Проверьте формат URL.");
        }

        const apiForRequest = `https://www.vprok.ru/web/api/v1/catalog/category/${categoryId}?sort=popularity_desc&limit=30&page=1`;


        const body = {
            noRedirect: true,
            url: urlForApi,
        };

        // Задержка перед выполнением запроса можно снизить, но на всякий случай подождем 5сек.
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Подключаем axios в глобальную видимоть
        await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js' });

        // Выполнение запроса через axios
        const response = await page.evaluate(
            async (url, method, requestBody) => {
                const axios = window.axios;
                try {
                    const response = await axios({
                        url,
                        method,
                        data: requestBody,
                    });

                    return response.data;
                } catch (error) {
                    throw new Error(`Ошибка HTTP: ${error.response?.status || error.message}`);
                }
            },
            apiForRequest,
            "POST",
            body
        );

        const products = response.products.map((item) => {
            return {
                name: item.name,
                image: item.images[0]?.url.replace("<SIZE>", "x500"),
                rating: item.rating,
                reviews: item.reviews,
                price: item.price,
                discountPrice: item.discountPercent ? item.price : 0,
                oldPrice: item.oldPrice,
                discountPercent: item.discountPercent,
            };
        });

        const separator = '\n' + '-'.repeat(80) + '\n';

        const data = products
            .map((item) => {
                return `\n` +
                    `Название товара: ${item.name}\n` +
                    `Ссылка на изображение: ${item.image}\n` +
                    `Рейтинг: ${item.rating}\n` +
                    `Количество отзывов: ${item.reviews}\n` +
                    `Цена: ${item.price}\n` +
                    `${item.discountPrice ? `Акционная цена: ${item.discountPrice}\n` : ''}` +
                    `${item.oldPrice ? `Цена до акции: ${item.oldPrice}\n` : ''}` +
                    `${item.discountPercent ? `Размер скидки: ${item.discountPercent}%\n` : ''}` +
                    separator;
            })
            .join("");

        fs.writeFile("products-api.txt", data, (err) => {
            if (err) {
                console.error("Ошибка записи в файл:", err);
                throw err;
            }
            console.log("Данные успешно записаны в файл products-api.txt");
        });

    } catch (e) {
        throw new Error(`Ошибка в scrapeProduct: ${e.message}`);
    } finally {
        await browser.close();
    }
    return true;
}

async function parser() {
    const url = process.argv[2];
    if (!url) {
        console.error("Необходимо указать URL.");
        process.exit(1);
    }
    let attempt = 0;
    const loadingTime = 30000;
    while (attempt < 3) {
        try {
            const result = await scrapeProduct(loadingTime, url);
            if (result) {
                return true;
            }
        } catch (error) {
            console.error(`Попытка ${attempt + 1}: ${error.message}`);
            attempt++;
        }
    }
    throw new Error(
        `Не удалось получить данные после ${attempt} неудачных попыток:(`
    );
}

parser()
    .then(() => {
        console.log("Все выполнено:)"), process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
