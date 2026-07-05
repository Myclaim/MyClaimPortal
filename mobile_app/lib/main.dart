import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'screens/login_screen.dart';
import 'screens/main_shell.dart';
import 'utils/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: MyClaimApp(),
    ),
  );
}

class MyClaimApp extends StatelessWidget {
  const MyClaimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: Size(390, 844), // Standard modern phone size
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (_, child) {
        return MaterialApp(
          title: 'My Claim',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.darkTheme,
          home: Consumer<AuthProvider>(
            builder: (context, auth, _) {
              return AnimatedSwitcher(
                duration: Duration(milliseconds: 400),
                child: auth.isAuthenticated
                    ? MainShell()
                    : LoginScreen(),
              );
            },
          ),
        );
      },
    );
  }
}
