import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/biometric_service.dart';

class BiometricProvider with ChangeNotifier {
  static const _key = 'biometric_enabled';
  static const _promptShownKey = 'biometric_prompt_shown';

  bool _isEnabled = false;
  bool _isAvailable = false;
  bool _promptShown = false;

  bool get isEnabled => _isEnabled;
  bool get isAvailable => _isAvailable;
  bool get promptShown => _promptShown;

  BiometricProvider() {
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    _isEnabled = prefs.getBool(_key) ?? false;
    _promptShown = prefs.getBool(_promptShownKey) ?? false;
    _isAvailable = await BiometricService.isAvailable();
    notifyListeners();
  }

  Future<void> refresh() async {
    _isAvailable = await BiometricService.isAvailable();
    final prefs = await SharedPreferences.getInstance();
    _isEnabled = prefs.getBool(_key) ?? false;
    _promptShown = prefs.getBool(_promptShownKey) ?? false;
    notifyListeners();
  }

  Future<void> enable() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, true);
    _isEnabled = true;
    notifyListeners();
  }

  Future<void> disable() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, false);
    _isEnabled = false;
    notifyListeners();
  }

  /// Call this on logout so the next user gets the biometric setup prompt
  Future<void> resetForNewUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, false);
    await prefs.setBool(_promptShownKey, false);
    _isEnabled = false;
    _promptShown = false;
    notifyListeners();
  }

  Future<void> markPromptShown() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_promptShownKey, true);
    _promptShown = true;
    notifyListeners();
  }

  /// Authenticate user. Returns true on success.
  Future<bool> authenticate() async {
    return BiometricService.authenticate(usePasscodeFallback: true);
  }
}
