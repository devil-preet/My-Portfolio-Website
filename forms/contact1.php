<?php

// Replace with your actual email address
$recipient_email = "anmolpreet.kaur.offial@gmail.com";

// Include PHPMailer library
require_once 'path/to/PHPMailer/src/PHPMailer.php';
require_once 'path/to/PHPMailer/src/SMTP.php';
require_once 'path/to/PHPMailer/src/Exception.php';

// Create a new PHPMailer instance
$mail = new PHPMailer(true);

// Try setting SMTP configuration (optional but recommended)
try {
  // Replace with your SMTP server details
  $mail->SMTPDebug = 0; // Enable verbose debug output
  $mail->isSMTP();
  $mail->Host = 'your_smtp_host';
  $mail->SMTPAuth = true;
  $mail->Username = 'your_smtp_username';
  $mail->Password = 'your_smtp_password';
  $mail->SMTPSecure = 'tls'; // or 'ssl'
  $mail->Port = 587; // or 465
} catch (Exception $e) {
  echo "Error setting SMTP: " . $e->getMessage();
  exit;
}

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

// Validate data (optional)
// ... (add validation logic if needed)

// Set email content
$mail->setFrom($email, $name);
$mail->addAddress($recipient_email);
$mail->Subject = $subject;
$mail->Body = "Name: $name\nEmail: $email\nSubject: $subject\n\nMessage:\n$message";

// Send the email
if (!$mail->send()) {
  echo "Error sending email: " . $mail->ErrorInfo;
} else {
  echo "Success! Message sent.";
}

?>
