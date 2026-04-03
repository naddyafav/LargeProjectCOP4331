import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  final Map user;
  final String token;

  const HomePage({super.key, required this.user, required this.token});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Home"),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),

            Text(
              "Welcome, ${user["firstName"]} ${user["lastName"]}",
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            Text("Username: ${user["username"]}"),
            Text("Email: ${user["email"]}"),

            const SizedBox(height: 30),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("Logout"),
            ),
          ],
        ),
      ),
    );
  }
}