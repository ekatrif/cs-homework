import json

with open('output/outputCSV.txt', 'r', encoding='utf-8') as f:
    data = eval(f.read())

output_data = {"data": data}
# Убираем indent=2 для компактного JSON без пробелов
json_string = json.dumps(output_data, ensure_ascii=False, separators=(',', ':'))

# Сохраняем напрямую, без двойной сериализации
with open('input/10mb.json', 'w', encoding='utf-8') as f:
    f.write(json_string)