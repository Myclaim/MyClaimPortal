import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _errorMessage;
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Map<String, dynamic>? get user => _user;
  String get userName => _user?['name'] ?? 'Client';
  String get userEmail => _user?['email'] ?? '';
  String get userPhone => _user?['phone']?.toString().isNotEmpty == true ? _user!['phone'].toString() : '+91 0000000000';
  String get userRole => _user?['role'] ?? 'client';

  AuthProvider() {
    _checkStoredAuth();
  }

  Future<void> _checkStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userJsonStr = prefs.getString('user');
    if (token != null && userJsonStr != null) {
      try {
        _user = jsonDecode(userJsonStr) as Map<String, dynamic>;
      } catch (_) {}
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await ApiService.login(email, password);
      if (result['success'] == true) {
        var data = result['data'] as Map<String, dynamic>;
        final token = data['token'] as String?;
        if (token != null) {
          await ApiService.saveToken(token);
          
          if (data['role'] == 'client') {
            final profile = await ApiService.getClientProfile();
            if (profile != null) {
              profile['token'] = token;
              data = profile;
            }
          }

          // Persist user object
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('user', jsonEncode(data));
          _user = data;
          _isAuthenticated = true;
          _isLoading = false;
          notifyListeners();
          return true;
        }
      }
      _errorMessage = result['message'] ?? 'Login failed';
    } catch (e) {
      _errorMessage = 'Connection error. Please check the server is running.';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> refreshProfile() async {
    try {
      final profile = await ApiService.getClientProfile();
      if (profile != null && _user != null) {
        // preserve token if it was inside the user object
        final token = _user!['token'];
        if (token != null) {
          profile['token'] = token;
        }
        _user = profile;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(_user));
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> logout() async {
    await ApiService.clearToken();
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }
}
