import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = false;
  String? _errorMessage;

  Map<String, dynamic>? get dashboardData => _dashboardData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Map<String, dynamic> get overview =>
      _dashboardData?['overview'] ??
      {'totalClaims': 3, 'inProgress': 2, 'completed': 1, 'needAction': 2};

  List<dynamic> get claims =>
      _dashboardData?['claims'] ??
      [
        {
          'name': 'TATA STEEL',
          'status': 'Active',
          'progress': 80,
          'folio': 'TWD004589',
          'shares': '120',
          'isin': 'INE081A01020',
          'estValue': '₹1.88L',
        },
        {
          'name': 'L&T LIMITED',
          'status': 'In Progress',
          'progress': 60,
          'folio': 'LT098765',
          'shares': '50',
          'isin': 'INE018A01030',
          'estValue': '₹90K',
        },
        {
          'name': 'WIPRO LTD',
          'status': 'Docs Pending',
          'progress': 45,
          'folio': 'WP234112',
          'shares': '410',
          'isin': 'INE075A01022',
          'estValue': '₹1.87L',
        },
      ];

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
