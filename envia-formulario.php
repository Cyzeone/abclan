<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}

// === RATE LIMIT SIMPLES ===
// Limita para 1 envio a cada 30 segundos por IP
$ip = $_SERVER['REMOTE_ADDR'];
$now = time();
$limit_seconds = 30;

if (isset($_SESSION['last_submit_time'][$ip]) && ($now - $_SESSION['last_submit_time'][$ip]) < $limit_seconds) {
    echo json_encode(['success' => false, 'message' => 'Por favor, aguarde antes de enviar novamente.']);
    exit;
}

// Função para validar telefone brasileiro simples (somente números 10 ou 11 dígitos)
function validarTelefone($telefone) {
    return preg_match('/^\d{10,11}$/', $telefone);
}

// Função para validar email com filtro PHP
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Sanitização simples
function sanitize($data) {
    return htmlspecialchars(trim($data));
}

if (isset($_POST["empresa"]) && isset($_POST["responsavel"])) {
    // Formulário de Orçamento
    $empresa     = sanitize($_POST["empresa"]);
    $responsavel = sanitize($_POST["responsavel"]);
    $email       = sanitize($_POST["email"]);
    $telefone    = preg_replace('/\D+/', '', $_POST["telefone"]); // remove tudo que não é dígito
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
            "destinatarios" => ["cpagels@abclan.com.br"]
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

// Cabeçalhos do email
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";

// Enviar BCC para controle (substitua pelo seu email real)
$bccEmail = "formulario.abclan@gmail.com";
$headers .= "Bcc: $bccEmail\r\n";

// Envio do email
$enviado = true;
foreach ($destinatarios as $para) {
    if (!mail($para, $titulo_email, $corpo, $headers)) {
        $enviado = false;
    }
}

// Se envio foi bem sucedido, atualiza tempo para rate limit
if ($enviado) {
    $_SESSION['last_submit_time'][$ip] = $now;

    // Grava log simples
    $logEntry = date('Y-m-d H:i:s') . " - IP: $ip - Assunto: $titulo_email - Email: $email\n";
    file_put_contents('envios.log', $logEntry, FILE_APPEND | LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'Formulário enviado com sucesso.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao enviar a mensagem. Tente novamente.']);
}
