import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = false;
  String? _errorMessage;

  Map<String, dynamic>? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Map<String, dynamic> get overview => _dashboardData?['overview'] ?? {};

  List<dynamic> get claims => _dashboardData?['claims'] ?? [];

  Future<void> fetchDashboard() async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await ApiService.getClientDashboard();
      if (data != null) {
        _dashboardData = data;
        _errorMessage = null;
      }
    } catch (e) {
      _errorMessage = 'Could not load dashboard. Using cached data.';
    }

    _isLoading = false;
    notifyListeners();
  }
}
