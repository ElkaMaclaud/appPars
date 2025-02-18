const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require('path');
const { exec } = require("child_process");

async function scrapeProduct(loadingTime, url, region) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-notifications',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--disable-extensions',
            '--disable-popup-blocking'
        ]
    })
    const page = await browser.newPage();
    // Перехват запросов если все же будут таковые на всякий случай
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.url().includes('push')) {
            request.abort(); // Отменить запросы на пуш-уведомления
        } else {
            request.continue();
        }
    });

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    page.on("console", (msg) => {
        console.log("Браузер:", msg.text());
    });

    try {
        // await page.goto(url, {waitUntil: "domcontentloaded"}) - НЕ РАБОТАЕТ, ПОТОМУ ЧТО ПРОИСХОДИТ РЕДИРЕКТ!!!
        await page.goto(url, { waitUntil: "networkidle2", timeout: loadingTime });
        await page.setViewport({ width: 1280, height: 1024 });

        async function waitFor(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }


        await page.waitForSelector(".Region_regionIcon__oZ0Rt", { visible: true });

        const isClickable = await page.evaluate(() => {
            const element = document.querySelector(".Region_regionIcon__oZ0Rt");
            return element && element.offsetParent !== null;
        });


        if (isClickable) {
            // Ожидаем искусстенно, возможно происходит асинхронная загрузка контента (элемент виден, но не кликабелен какое-то время) 
            // Либо элемент может быть временно отключен
            // Либо  элемент не находится в правильном состоянии или если на странице происходят другие события, которые мешают клику
            await waitFor(2500);
            const maxAttempts = 3;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    await page.click(".Region_regionIcon__oZ0Rt");
                    console.log("Клик выполнен успешно.");
                    break;
                } catch (error) {
                    console.error(`Ошибка при клике или навигации (попытка ${attempt}):`, error);
                    if (attempt === maxAttempts) {
                        throw new Error("Достигнуто максимальное количество попыток. Закрытие браузера.");
                    }
                    await waitFor(100);
                }
            }
        } else {
            throw new Error("Элемент перекрыт или не доступен для клика.");
        }

        const liElements = await page.$$('.UiRegionListBase_list__cH0fK li', { visible: true });
        let regionFound = false;
        if (!liElements || liElements.length === 0) {
            throw new Error("Элементы названий регионов не найдены по указанному селектору.");
        }

        for (let li of liElements) {
            const text = await page.evaluate(el => el.innerText, li);
            if (text.trim() === region) {
                regionFound = true;
                const liIsClickable = await page.evaluate(el => { // На всякий случай! Перед кликом никогда не будет лишним проверка на доступность(не перекрыт ли чем-ниб.)
                    return el && el.offsetParent !== null;
                }, li)
                if (liIsClickable) {
                    await li.click();
                    break;
                }
            }
        }

        if (!regionFound) {
            throw new Error(`Регион "${region}" не найден.`);
        }

        await page.waitForFunction(
            (region) =>
                document
                    .querySelector(".Region_region__6OUBn")
                    .innerText.includes(region),
            {},
            region
        );

        const screenshotPath = "screenshot.jpg";
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const productData = await page.evaluate(() => {
            const oldPriceElements = document.querySelector(
                ".Price_price__QzA8L.Price_size_XS__ESEhJ.Price_role_old__r1uT1"
            );
            const priceElements = document.querySelector(
                ".Price_price__QzA8L.Price_size_XL__MHvC1.Price_role_discount__l_tpE"
            );
            const ratingElement = document.querySelector(".ActionsRow_stars__EKt42");
            const reviewsElement = document.querySelector(".ActionsRow_reviews__AfSj_");

            const oldPrice = oldPriceElements ? oldPriceElements.textContent.replace(/[^,\d]/g, "").replace(",", ".") : "";
            const price = priceElements ? priceElements.textContent.replace(/[^,\d]/g, "").replace(",", ".") : "";
            const rating = ratingElement ? ratingElement.innerText.replace(/[^,\d]/g, "").replace(",", ".") : "Нет рейтинга";
            const reviews = reviewsElement ? reviewsElement.innerText.replace(/[^,\d]/g, "").replace(",", ".") : "Нет отзывов";

            return {
                oldPrice,
                price,
                rating,
                reviews,
            };
        });

        const output = `price=${productData.price}\n${productData.oldPrice ? "priceOld=" + productData.oldPrice + "\n" : ""
            }rating=${productData.rating}\nreviewCount=${productData.reviews
            }
  `;
        fs.writeFileSync("product.txt", output);


        const screenshotPathFull = path.resolve(__dirname, 'screenshot.jpg');
        const openCommand =
            process.platform === "win32"
                ? `start ${screenshotPathFull}`
                : process.platform === "darwin"
                    ? `open ${screenshotPathFull}`
                    : `xdg-open ${screenshotPathFull}`; // Для Linux
        exec(openCommand, (err) => {
            if (err) {
                console.error("Ошибка при открытии скриншота:", err);
            }
        });
    } catch (e) {
        throw new Error(`Ошибка в scrapeProduct: ${e.message}`);
    } finally {
        await browser.close();
    }
    return true
}

async function parser() {
    const [url, region] = process.argv.slice(2);
    if (!url || !region) {
        console.error("Необходимо указать URL и регион.");
        process.exit(1);
    }
    let attempt = 0;
    const loadingTime = 30000
    while (attempt < 3) {
        try {
            const result =
                await scrapeProduct(loadingTime, url, region)
            if (result) {
                return true
            }
        } catch (error) {
            console.error(`Попытка ${attempt + 1}: ${error.message}`);
            attempt++;
        }
    }
    throw new Error(`Не удалось получить страницу после ${attempt} неудачных попыток попыток :(`);
}

parser()
    .then(() => { console.log("Все выполнено:)"), process.exit(0) })
    .catch((e) => { console.error(e); process.exit(1) })
