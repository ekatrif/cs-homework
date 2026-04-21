import csv
import random
import string

def generate_text(base_id):
    """Генерация текста с вложенными кавычками, похожего на пример"""
    phrases = [
        f'He said "Hello, world! {random.randint(1,100)}" to everyone',
        f'She replied "That\'s amazing! {random.choice(["Wow", "Great", "Cool"])}" with smile',
        f'The message was: "Stay curious {random.choice(["always", "forever", "today"])}"',
        f'He shouted "Go {random.choice(["ahead", "forward", "on"])}!" and waved',
        f'She whispered "I love {random.choice(["coding", "data", "python"])}" quietly',
        f'They asked "{random.choice(["Why", "How", "When"])} is it possible?" with surprise',
        f'The note said: "{random.choice(["Hello", "Hi", "Greetings"])} from author {base_id}"',
        f'He wrote "{string.ascii_letters[random.randint(0,25)]}{random.randint(10,99)}" as code',
        f'She exclaimed "What a {random.choice(["beautiful", "nice", "great"])} day!" cheerfully',
        f'He announced "The answer is {random.randint(1,1000)}" to the crowd'
    ]
    return random.choice(phrases)

def generate_name():
    """Генерация случайного имени автора"""
    first = random.choice(['John', 'Jane', 'Bob', 'Alice', 'Mike', 'Sarah', 'Tom', 'Emma', 'Alex', 'Olivia'])
    last = random.choice(['Smith', 'Brown', 'Lee', 'Wang', 'Kim', 'Davis', 'Wilson', 'Taylor'])
    return f"{first} {last}" if random.random() > 0.5 else first

# Параметры
target_size_mb = 10
target_size_bytes = target_size_mb * 1024 * 1024
output_file = '../input/10mb.csv'
buffer_size = 8192

print(f"Цель: создать CSV файл размером ~{target_size_mb} МБ")
print("Генерация данных...")

# Сначала оценим размер одной строки
sample_rows = []
sample_ids = range(1, 101)
for i in sample_ids:
    row = [str(i), generate_text(i), generate_name()]
    sample_rows.append(row)

# Измерим размер в памяти
import io
sample_buffer = io.StringIO()
writer = csv.writer(sample_buffer, quoting=csv.QUOTE_ALL, doublequote=True)
writer.writerow(['id', 'text', 'author'])
for row in sample_rows:
    writer.writerow(row)
sample_size = len(sample_buffer.getvalue().encode('utf-8'))
avg_row_size = sample_size / 100
rows_needed = int(target_size_bytes / avg_row_size) + 100

print(f"Средний размер строки: ~{avg_row_size:.0f} байт")
print(f"Нужно сгенерировать: ~{rows_needed} строк")

# Генерация файла
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL, doublequote=True)
    writer.writerow(['id', 'text', 'author'])
    
    for i in range(1, rows_needed + 1):
        text = generate_text(i)
        author = generate_name()
        writer.writerow([str(i), text, author])
        
        # Прогресс каждые 100k строк
        if i % 100000 == 0:
            print(f"Сгенерировано {i} строк...")

# Проверка размера
import os
file_size = os.path.getsize(output_file)
print(f"\nГотово! Файл: {output_file}")
print(f"Размер: {file_size / (1024*1024):.2f} МБ")
print(f"Строк: {rows_needed}")