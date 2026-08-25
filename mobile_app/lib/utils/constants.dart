import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF4ADE80); // Neon Green
  static const Color primaryDark = Color(0xFF22C55E);
  static const Color accent = Color(0xFF00E676); // Vibrant Green
  static const Color accentDark = Color(0xFF00C853);
  static const Color secondary = Color(0xFFEC4899); // Pink (if needed)
  static const Color warning = Color(0xFFF59E0B); // Amber
  static const Color error = Color(0xFFEF4444); // Red
  static const Color success = Color(0xFF10B981); // Emerald green
  static const Color purple = Color(0xFF818CF8); // Indigo-300
  static const Color blue = Color(0xFF3B82F6); // Blue

  static const LinearGradient greenGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00E676), Color(0xFF22C55E), Color(0xFF4ADE80)],
  );

  // Dark background layers
  static const Color background = Color(0xFF121212); // Deep Charcoal
  static const Color surface = Color(0xFF1E1E1E); // Elevated Surface
  static const Color surfaceLight = Color(0xFF2C2C2C); // Lighter Surface
  static const Color card = Color(0xFF1A1D1F); // Card Background
  static const Color cardSoft = Color(0xFF111315);

  // Text
  static const Color text = Color(0xFFF8FAFC); // Slate 50
  static const Color textSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color border = Color(0xFF2C2C2C);

  // Light Theme Colors
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surfaceLight2 = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color textLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color borderLight = Color(0xFFE2E8F0);
}

extension ContextTheme on BuildContext {
  bool get isDark => Theme.of(this).brightness == Brightness.dark;
  
  Color get surfaceColor => isDark ? AppColors.surface : AppColors.surfaceLight2;
  Color get textColor => isDark ? AppColors.text : AppColors.textLight;
  Color get textSecondaryColor => isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
  Color get backgroundColor => isDark ? AppColors.background : AppColors.backgroundLight;
  Color get borderColor => isDark ? Colors.white.withValues(alpha: 0.08) : AppColors.borderLight;
}
