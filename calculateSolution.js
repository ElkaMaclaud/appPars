import crypto from "crypto";

function calculateSolution(challengeSignature, challengeComplexity) {
  let randomStart = 0; // Начинаем с 0
  let solution = null;

  while (true) {
    // Генерируем хэш
    let hash = customHash(challengeComplexity + String(randomStart));

    // Проверяем, совпадает ли хэш с подписью
    if (hash === challengeSignature) {
      solution = randomStart;
      break;
    }

    randomStart++; // Увеличиваем значение
  }

  return solution;
}

function customHash(input) {
  // Используем SHA-256 для генерации хэша
  return crypto.createHash("sha256").update(input).digest("base64");
}

// Реальные данные
const challengeSignature = "SKkt7FXKgOChwAMHcisdz8dHxbE="; // Подпись из куки
const challengeComplexity = "10"; // Сложность из куки

// Вычисляем solution
const solution = calculateSolution(challengeSignature, challengeComplexity);
console.log("Calculated solution:", solution);




const cookies = cookieString.split('; ').reduce((acc, cookie) => {
  const [key, value] = cookie.split('=');
  acc[key] = value;
  return acc;
}, {});