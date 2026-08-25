with open('lib/screens/main_shell.dart', 'r') as f:
    c = f.read()

c = c.replace('const HomeScreen(onNavigate: null),', 'HomeScreen(onNavigate: _onNavigate),')

with open('lib/screens/main_shell.dart', 'w') as f:
    f.write(c)
print("Done")
