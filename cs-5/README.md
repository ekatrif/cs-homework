# Основные команды

- npm run build - Сборка проекта
- node dist/benchmarks - Запуск benchmarks
- node --jitless dist/benchmarks - Запуск benchmarks без JIT

# 📊 Анализ производительности реализаций PixelStream

## 🏆 Общий рейтинг

| Место | Реализация | Побед в тестах | Общая оценка |
|-------|------------|----------------|--------------|
| 1 | FlatArray | 6/8 | ⭐⭐⭐⭐⭐ |
| 2 | TypedArray | 2/8 | ⭐⭐⭐⭐ |
| 3 | ArrayOfObjects | 0/8 | ⭐⭐ |
| 4 | ArrayOfArrays | 0/8 | ⭐ |

---

## 📈 Ключевые инсайты

### 1. RowMajor vs ColMajor

Все реализации быстрее при обходе по строкам (RowMajor):

| Реализация | RowMajor | ColMajor | Разница |
|------------|----------|----------|---------|
| FlatArray | 2.36ms | 2.69ms | +14% |
| ArrayOfArrays | 5.94ms | 14.73ms | +148% |

**Почему:** процессоры оптимизированы для последовательного доступа к памяти (CPU cache).

### 2. FlatArray vs TypedArray

Ожидалось, что TypedArray будет быстрее везде, но результаты оказались неожиданными:

| Операция | FlatArray | TypedArray |
|----------|-----------|------------|
| setPixel | 2.75ms ✅ | 7.63ms |
| forEach | 2.36ms | 1.79ms ✅ |

**Объяснение:**
- `forEach` в TypedArray хорошо оптимизирован JIT-компилятором
- `setPixel` страдает от проверки границ (0-255) и преобразования типов

### 3. Стоимость создания объектов

```javascript
// ArrayOfObjects - каждый setPixel создаёт новый объект
setPixel() {
  this.data[y][x] = { r, g, b, a };
}
// Результат: 10.88ms

// FlatArray - просто меняет число в массиве
setPixel() {
  this.data[idx] = r;
  this.data[idx + 1] = g;
}
// Результат: 2.75ms

## 🎯 Рекомендации по выбору

| Сценарий | Лучший выбор | Причина |
|----------|--------------|---------|
| Много записей (setPixel) | `FlatArray` | В 2.8x быстрее TypedArray |
| Много чтений (getPixel) | `FlatArray` | Почти одинаков с ArrayOfObjects |
| Итерации без модификаций | `TypedArray` | На 32% быстрее FlatArray |
| Смешанные операции | `FlatArray` | Лучший баланс |
| Работа с WebGL/Canvas | `TypedArray` | Совместимость с буферами |
| Читаемость кода | `ArrayOfObjects` | Понятный код, но медленный |
| Никогда не используйте | `ArrayOfArrays` | Медленный везде |

