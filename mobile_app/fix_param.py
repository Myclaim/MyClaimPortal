import sys

with open('lib/screens/home_screen.dart', 'r') as f:
    content = f.read()

content = content.replace('_buildWelcomeSection(firstName),', '_buildWelcomeSection(firstName, dash),')
content = content.replace('Widget _buildWelcomeSection(String name) {', 'Widget _buildWelcomeSection(String name, DashboardProvider dash) {')

with open('lib/screens/home_screen.dart', 'w') as f:
    f.write(content)
