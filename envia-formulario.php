<?php
session_start();
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}

// RATE LIMIT SIMPLES 
$ip = $_SERVER['REMOTE_ADDR'];
$now = time();
$limit_seconds = 30;

if (isset($_SESSION['last_submit_time'][$ip]) && ($now - $_SESSION['last_submit_time'][$ip]) < $limit_seconds) {
    echo json_encode(['success' => false, 'message' => 'Por favor, aguarde antes de enviar novamente.']);
    exit;
}

// Funções de validação
function validarTelefone($telefone) {
    return preg_match('/^\d{10,11}$/', $telefone);
}

function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function sanitize($data) {
    return htmlspecialchars(trim($data));
}


// Determina tipo de formulário
if (isset($_POST["empresa"]) && isset($_POST["responsavel"])) {
    // Formulário de Orçamento
    $empresa     = sanitize($_POST["empresa"]);
    $responsavel = sanitize($_POST["responsavel"]);
    $email       = sanitize($_POST["email"]);
    $telefone    = preg_replace('/\D+/', '', $_POST["telefone"]);
    $descricao   = sanitize($_POST["descricao"]);

    // Validações
    if (!$empresa || !$responsavel || !$email || !$telefone || !$descricao) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.']);
        exit;
    }
    if (!validarEmail($email)) {
        echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
        exit;
    }
    if (!validarTelefone($telefone)) {
        echo json_encode(['success' => false, 'message' => 'Telefone inválido.']);
        exit;
    }

    $destinatarios = [
        "arnaldo@abclan.com.br",
        "denis@abclan.com.br",
        "rogerio@abclan.com.br",
        "cpagels@abclan.com.br"
    ];
    $titulo_email = "Solicitação de Orçamento - ABC LAN";

    $corpo = "Empresa: $empresa\n";
    $corpo .= "Responsável: $responsavel\n";
    $corpo .= "E-mail: $email\n";
    $corpo .= "Telefone: $telefone\n\n";
    $corpo .= "Descrição do Projeto:\n$descricao\n";

} elseif (isset($_POST["assunto"]) && isset($_POST["mensagem"])) {
    // Formulário de Contato
    $nome     = sanitize($_POST["name"] ?? $_POST["nome"] ?? '');
    $email    = sanitize($_POST["email"]);
    $telefone = preg_replace('/\D+/', '', $_POST["telefone"]);
    $assunto  = strtolower(trim($_POST["assunto"]));
    $mensagem = sanitize($_POST["mensagem"]);

    // Validações
    if (!$nome || !$email || !$telefone || !$assunto || !$mensagem) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.']);
        exit;
    }
    if (!validarEmail($email)) {
        echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
        exit;
    }
    if (!validarTelefone($telefone)) {
        echo json_encode(['success' => false, 'message' => 'Telefone inválido.']);
        exit;
    }

    $assuntoMap = [
        "financeiro" => [
            "label" => "Financeiro",
            "destinatarios" => ["alessandro@abclan.com.br"]
        ],
        "duvidas" => [
            "label" => "Dúvidas",
            "destinatarios" => ["comercial02@abclan.com.br"]
        ],
        "outros" => [
            "label" => "Outros",
            "destinatarios" => ["abclantelecom@gmail.com"]
        ]
    ];

    $assuntoInfo = $assuntoMap[$assunto] ?? [
        "label" => "Assunto Não Especificado",
        "destinatarios" => ["abclantelecom@gmail.com"]
    ];

    $titulo_email = "Mensagem - " . $assuntoInfo["label"];
    $destinatarios = $assuntoInfo["destinatarios"];

    $corpo = "Nome: $nome\n";
    $corpo .= "E-mail: $email\n";
    $corpo .= "Telefone: $telefone\n\n";
    $corpo .= "Assunto: $titulo_email\n\n";
    $corpo .= "Mensagem:\n$mensagem\n";

} else {
    echo json_encode(['success' => false, 'message' => 'Formulário inválido.']);
    exit;
}


// Configuração PHPMailer
$mail = new PHPMailer(true);

try {
    // Configurações do SMTP do cliente
    $mail->isSMTP();
    $mail->Host       = 'mail.abclan.com.br'; 
    $mail->SMTPAuth   = true;
    $mail->Username   = 'cpagels@abclan.com.br'; // email do cliente
    $mail->Password   = 'SENHA_DO_EMAIL'; // senha do email ou app password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('cpagels@abclan.com.br', 'ABC LAN'); 
    $mail->addReplyTo($email);

    // Destinatários
    foreach ($destinatarios as $dest) {
        $mail->addAddress($dest);
    }

    // BCC de controle
    $mail->addBCC('formulario.abclan@gmail.com');

    // Conteúdo do email
    $mail->Subject = $titulo_email;
    $mail->Body    = $corpo;

    // Envia email
    $mail->send();

    // Atualiza rate limit
    $_SESSION['last_submit_time'][$ip] = $now;

    // Grava log simples
    $logEntry = date('Y-m-d H:i:s') . " - IP: $ip - Assunto: $titulo_email - Email: $email\n";
    file_put_contents('envios.log', $logEntry, FILE_APPEND | LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'Formulário enviado com sucesso.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao enviar a mensagem: ' . $mail->ErrorInfo]);
}