<?php

$from_email = 'contacto@insurtech.com';
$from_name = 'Insurtech';
$subject = 'Contacto (' . $_SERVER['HTTP_HOST'] .')';
$content = array('Hola, deseo recibir más información, mis datos son:');

$fields = array(
	'name' => array(
		'required' => true,
		'label' => 'Nombre'
	),
	'last_name' => array(
		'required' => true,
		'label' => 'Apellido'
	),
	'email' => array(
		'required' => true,
		'label' => 'Email',
		'email' => true
	),
	'phone' => array(
		'required' => false,
		'label' => 'Teléfono'
	),
	'message' => array(
		'required' => true,
		'label' => 'Mensaje'
	)
);

$values = array();
foreach ($fields as $key => $field) {
	$value = isset($_POST[$key]) ? filter_var($_POST[$key], !empty($field['email']) ? FILTER_SANITIZE_EMAIL : FILTER_SANITIZE_STRING) : '';
	
	if($field['required'] && empty($value)){
		die (json_encode(['success' => false, 'message' => $field['label'] . ': Es un campo requerido']));
	}

	if(!empty($value) && !empty($field['email']) && !filter_var($value, FILTER_VALIDATE_EMAIL)){
		die (json_encode(['success' => false, 'message' => $field['label'] . ': Debe ser un email válido']));
	}

	$values[$key] = $value;
	$content[] = $field['label'] . ': ' . htmlspecialchars($value);
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
$phpmailer = new PHPMailer(true);

try{
	$phpmailer->isSMTP();
	$phpmailer->CharSet = 'UTF-8';

	$phpmailer->Host       = 'smtp.mailtrap.io';
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = 'ce48f724ee5161';
    $phpmailer->Password   = '60c3d5b2b22a30';
    $phpmailer->SMTPSecure = 'tls';
    $phpmailer->Port       = 2525;

    $phpmailer->SMTPOptions = array(
		'ssl' => array(
			'verify_peer' => false,
			'verify_peer_name' => false,
			'allow_self_signed' => true
		)
	);

	$phpmailer->setFrom($values['email'], $values['name'] . ' ' . $values['last_name']);
	$phpmailer->addAddress($from_email, $from_name);
	$phpmailer->addReplyTo($values['email'], $values['name'] . ' ' . $values['last_name']);
	/*$phpmailer->addCC('cc@example.com');
	$phpmailer->addBCC('bcc@example.com');*/
	$phpmailer->isHTML(true);
	$phpmailer->Subject = $subject;
	$phpmailer->Body    = join('<br />', $content);
	$phpmailer->AltBody = join(' -', $content);
	$phpmailer->send();

	die (json_encode(['success' => true, 'message' => 'Gracias por tu información. Nuestro equipo se pondrá en contacto contigo pronto.']));

} catch (Exception $e) {
	
    die (json_encode(['success' => false, 'message' => 'El servicio no está disponible, por favor intente de nuevo más tarde.', 'debug' => $phpmailer->ErrorInfo]));
}