import 'package:flutter/material.dart';

class FamilyMember {
  final String id;
  final String name;
  final String relation;
  final String email;
  final bool isPrimary;

  FamilyMember({
    required this.id,
    required this.name,
    required this.relation,
    required this.email,
    this.isPrimary = false,
  });
}

class FamilyTreeProvider with ChangeNotifier {
  final List<FamilyMember> _members = [
    FamilyMember(
      id: '1',
      name: 'Pratham Patil',
      relation: 'Primary Client',
      email: 'pratham@example.com',
      isPrimary: true,
    ),
  ];

  List<FamilyMember> get members => _members;

  void addMember({required String name, required String relation, String email = ''}) {
    _members.add(FamilyMember(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      relation: relation,
      email: email.isEmpty ? '${name.toLowerCase().replaceAll(' ', '')}@example.com' : email,
    ));
    notifyListeners();
  }

  void removeMember(String id) {
    _members.removeWhere((m) => m.id == id);
    notifyListeners();
  }
}
