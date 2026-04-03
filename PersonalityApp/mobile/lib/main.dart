import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'login_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Personality App',
      home: const LoginPage(),
    );
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  String message = "";
  bool isLoading = false;
  bool hidePassword = true;

  Future<void> registerUser() async {
    if (firstNameController.text.trim().isEmpty ||
        lastNameController.text.trim().isEmpty ||
        emailController.text.trim().isEmpty ||
        usernameController.text.trim().isEmpty ||
        passwordController.text.trim().isEmpty) {
      setState(() {
        message = "Please fill in all fields.";
      });
      return;
    }

    setState(() {
      isLoading = true;
      message = "";
    });

    try {
      final Uri url = Uri.parse("http://104.236.41.135:5050/register");

      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "firstName": firstNameController.text.trim(),
          "lastName": lastNameController.text.trim(),
          "email": emailController.text.trim(),
          "username": usernameController.text.trim(),
          "password": passwordController.text.trim(),
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        setState(() {
          message = data["message"] ?? "Registration successful.";
        });

        firstNameController.clear();
        lastNameController.clear();
        emailController.clear();
        usernameController.clear();
        passwordController.clear();
      } else {
        setState(() {
          message = data["error"] ?? "Registration failed.";
        });
      }
    } catch (e) {
      setState(() {
        message = "Connection error: $e";
      });
    }

    setState(() {
      isLoading = false;
    });
  }

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    emailController.dispose();
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Widget buildInputBox({
    required TextEditingController controller,
    required String label,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: isPassword ? hidePassword : false,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: isPassword
              ? IconButton(
            icon: Icon(
              hidePassword ? Icons.visibility_off : Icons.visibility,
            ),
            onPressed: () {
              setState(() {
                hidePassword = !hidePassword;
              });
            },
          )
              : null,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Register"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),
            buildInputBox(controller: firstNameController, label: "First Name"),
            buildInputBox(controller: lastNameController, label: "Last Name"),
            buildInputBox(
              controller: emailController,
              label: "Email",
              keyboardType: TextInputType.emailAddress,
            ),
            buildInputBox(controller: usernameController, label: "Username"),
            buildInputBox(
              controller: passwordController,
              label: "Password",
              isPassword: true,
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: isLoading ? null : registerUser,
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Register"),
              ),
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                );
              },
              child: const Text("Already have an account? Login"),
            ),
            const SizedBox(height: 10),
            Text(
              message,
              style: TextStyle(
                color: message.toLowerCase().contains("successful")
                    ? Colors.green
                    : Colors.red,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}