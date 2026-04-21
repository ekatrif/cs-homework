import json

with open('output/output.txt', 'r', encoding='utf-8') as f:
    data = eval(f.read())

output_data = {"data": data}
json_string = json.dumps(output_data, ensure_ascii=False, indent=2)

# Save the JSON string as a string literal to file
with open('input/10mb.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(json_string, ensure_ascii=False))