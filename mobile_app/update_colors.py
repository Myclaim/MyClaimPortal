import sys
import re

def update_file(path):
    with open(path, 'r') as f:
        content = f.read()

    # Replace gradient
    gradient_pattern = r"gradient:\s*LinearGradient\(\s*begin:\s*Alignment\.topLeft,\s*end:\s*Alignment\.bottomRight,\s*colors:\s*\[Color\(0xFF3D2C8D\),\s*Color\(0xFF6C3BAA\),\s*Color\(0xFF916BBF\)\],\s*\)"
    content = re.sub(gradient_pattern, "gradient: AppColors.greenGradient", content)

    # Replace hardcoded purple in claims_screen
    content = content.replace("const Color(0xFF6C3BAA)", "AppColors.primary")

    with open(path, 'w') as f:
        f.write(content)

update_file("lib/screens/claims_screen.dart")
update_file("lib/screens/services_screen.dart")
