with open('lib/screens/documents_screen.dart', 'r') as f:
    c = f.read()

# Fix KycDocCard URL - prepend base URL for relative paths
c = c.replace(
    "if (isUploaded && url != null) {\n          await launchUrl(Uri.parse(url!), mode: LaunchMode.externalApplication);\n        }",
    "if (isUploaded && url != null) {\n          final fullUrl = url!.startsWith('http') ? url! : 'https://myclaimportal.onrender.com\$url';\n          await launchUrl(Uri.parse(fullUrl), mode: LaunchMode.externalApplication);\n        }"
)

with open('lib/screens/documents_screen.dart', 'w') as f:
    f.write(c)
print("Done")
