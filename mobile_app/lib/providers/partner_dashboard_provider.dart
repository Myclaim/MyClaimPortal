import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PartnerDashboardProvider with ChangeNotifier {
  List<dynamic> _leads = [];
  List<dynamic> _clients = [];
  List<dynamic> _tickets = [];
  List<dynamic> _activities = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<dynamic> get leads => _leads;
  List<dynamic> get clients => _clients;
  List<dynamic> get tickets => _tickets;
  List<dynamic> get activities => _activities;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // ── Computed Stats ──────────────────────────────────────────
  int get totalLeads => _leads.length;
  int get newLeads => _leads.where((l) {
    final s = l['status']?.toString().toLowerCase() ?? '';
    return s == 'new' || s == '';
  }).length;
  int get convertedLeads => _leads.where((l) {
    return l['status']?.toString().toLowerCase() == 'converted';
  }).length;
  int get inDiscussionLeads => _leads.where((l) {
    return l['status']?.toString().toLowerCase() == 'in_discussion';
  }).length;
  int get activeClients => _clients.length;
  int get openTickets => _tickets.where((t) {
    final s = t['status']?.toString().toLowerCase() ?? '';
    return s != 'completed' && s != 'resolved' && s != 'closed';
  }).length;
  int get activeTickets => _tickets.where((t) {
    final s = t['status']?.toString().toLowerCase() ?? '';
    return s == 'active' || s == 'in_process';
  }).length;
  int get completedTickets => _tickets.where((t) {
    final s = t['status']?.toString().toLowerCase() ?? '';
    return s == 'completed' || s == 'resolved';
  }).length;

  // ── Fetch All Partner Data ──────────────────────────────────
  Future<void> fetchAll(String partnerId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getPartnerLeads(partnerId),
        ApiService.getPartnerClients(),
        ApiService.getPartnerTickets(),
        ApiService.getPartnerActivity(),
      ]);
      _leads = results[0];
      _clients = results[1];
      _tickets = results[2];
      _activities = results[3];
      _errorMessage = null;
    } catch (e) {
      _errorMessage = 'Could not load data. Pull to refresh.';
    }

    _isLoading = false;
    notifyListeners();
  }

  // ── Add Lead Locally After POST ────────────────────────────
  void addLeadLocally(Map<String, dynamic> lead) {
    _leads.insert(0, lead);
    notifyListeners();
  }
}
