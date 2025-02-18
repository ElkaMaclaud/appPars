const axios = require("axios");
const fs = require("fs");
const cookies = [
    "luuid=f13d259d-98d0-4e2b-a1be-dcb42062c5ee",
    "suuid=153f7111-c0ad-42b4-9655-28bfed7e446a",
    "split_segment=6",
    "split_segment_amount=11",
    "pickupAvailable=0",
    "deliveryTypeId=1",
    "shop=2527",
    "region=1",
    "standardShopId=2527",
    "_ym_uid=1739529725957696258",
    "_ym_d=1739529725",
    "flocktory-uuid=6a56e4ae-711e-48a2-afd7-a662ccd83d0b-6",
    "tmr_lvid=fdb8f57f8c4ae90a4ba7df8a58054369",
    "tmr_lvidTS=1739529725535",
    "advcake_track_id=65b0112f-e923-d397-dfb1-0288888f03e9",
    "advcake_session_id=d83f2d43-1112-88d9-3295-cc9eccfacf65",
    "gdeslon.ru.__arc_domain=gdeslon.ru",
    "gdeslon.ru.user_id=5217e5b5-e171-4ea1-9266-2805968c4554",
    "mindboxDeviceUUID=fe3266e3-60da-49ad-823e-281bdc13a653",
    "directCrm-session=%7B%22deviceGuid%22%3A%22fe3266e3-60da-49ad-823e-281bdc13a653%22%7D",
    "adrcid=Aaugdp1E2swe1Z2BEUH8nIw",
    "_ymab_param=Anh8qesXsiBfv8E9WOYIuUu-vY9QVkNGCnPQZD9Uhk0zKBjXBl_2KeIYFB881TGv-ML72zHVhZXWO6fEIGdf09f_vRg",
    "analytic_id=1739529727413403",
    "noHouse=0",
    "loyaltyOnboardingStatus=onboardingShown",
    "counterPage=6",
    "ngenix_jscv_9c7b371f0f1d=cookie_expires=1739960947&bot_profile_check=true&cookie_signature=d9OaH0ytJqrGHoATOf7MLibeuQg%3D",
    "access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5IiwianRpIjoidXVpZGYxM2QyNTlkLTk4ZDAtNGUyYi1hMWJlLWRjYjQyMDYyYzVlZThkM2E1YWUxYjgwNTlhNzA3OGRjMWYzMDNiNDU4ZDQ2Mjk3Y2UzMWIiLCJpYXQiOjE3Mzk4NzQ1NDkuNjA1NjU2LCJuYmYiOjE3Mzk4NzQ1NDkuNjA1NjU4LCJleHAiOjE3Mzk5NjA5NDkuNjAxMjM5LCJzdWIiOiIiLCJzY29wZXMiOltdLCJzcGxpdF9zZWdtZW50Ijo2LCJ4NWlkX2FjY2Vzc190b2tlbiI6IiIsImN1c3RvbWVyX3V1aWQiOiIifQ.FfZ-yAOv_XduLfJyXmVUejj8YJ0H1lR7qq-SH4Z05X96NvqotwMPTX94jilb-aHn5_rDrbqUKE9xITPnkV_o9mqQaH0QKsU92SfU2rnh3Ry8lkiHilS1OxI8JqdcicP9X66230bjnkU-ZwRw_i-C7b3Gg04Jl0vrCFC-H1zwsECTgss7CpgsRCnY9R_eLdH0i37c7rTJXMElVUEbYzICrRm58R-bUuFzsvPW18k8OXaCYFEA8Vd_0HK8_Hox7JFCZt_BDtwNagdMitefuVr4I3QbORpNSAMLPmE86sXAE7_jH79sTwM1-RjB39OL88FXs_2H2B7FPQ9wyvgRvxobah83FVd2duk_z_-fY-xGXB5taVVOj3Bz3neVRRssET2mjZDDJHBtw01vUqquAnDaWXz8SOxI9Jeve4HRK_3-ZKveyXaeIfI4SZuHw8GfWawuHYm0HR1ig6dcnMpWkklXQ9dvoXvle9XIG3HKvYwVEJPTjkz4WUNmvesnJPOxAncs43Yea6L1UApT3QRfGk2f6puGecgKx2qLVxUPgOVf6ozsQkfsBZSCymeAjXfAcMiv2NnNcW58skt8PWGLewFBnEnSD36fSj7sIRi-45CuKMjsM1jDFGrnCSxLj9423Gl6j5OADqyDALRA3-hqFZcqYrrPpgfN9BKzQ2iyhSNlGrE",
    "encryptedSessionId=8c9c43e6f99c0571688457477061efba5858b5fefa9653a77e2e1267b152439a",
    "_gid=GA1.2.736307253.1739874551",
    "_ym_isad=2",
    "domain_sid=AXeGoKbnVuHkb5L0y-5jx%3A1739874552327",
    "acs_3=%7B%22hash%22%3A%222519d36ba1d6b3a4bd08e045fbf175fd06f869ed%22%2C%22nextSyncTime%22%3A1739960953142%2C%22syncLog%22%3A%7B%22224%22%3A1739874553142%2C%221228%22%3A1739874553142%7D%7D",
    "adrdel=1739874553230",
    "referrer=www.vprok.ru",
    "ngx_s_id=YTc3MTNjMTAtYjQwMS00NTYwLTg3ZjgtNTc4MGNkOWM4YzZlQDE3Mzk4ODIwMjY5OTZAMTgwMDAwMEAxNzM5NTI5NzIxNzg0QDBiODdhMDU2NDE3NWNhZjFiNjZiMGE5YTlmMjNkMWQyNzNiNGI1OGRlMmU5OGQ1YmQ4NjVjNTdmZWQ5NTg0NjM="
];


const cookieHeader = cookies.join("; ");


async function fetchProducts(categoryUrl) {
    try {
        const response = await axios.get(categoryUrl, {
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Cookie": cookieHeader,
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
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            }
        });
        const html = response.data;

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