import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    lines = f.readlines()

new_lines = ["import '../services/api_service.dart';\n"]
for i, line in enumerate(lines):
    if line.strip() == "import '../services/api_service.dart';":
        continue
    new_lines.append(line)

with open('lib/screens/home_screen.dart', 'w') as f:
    f.writelines(new_lines)

