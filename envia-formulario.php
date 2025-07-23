<?php
// Verifica se o formulário foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Captura os dados do formulário
    $nome     = htmlspecialchars($_POST["name"]);
    $email    = htmlspecialchars($_POST["email"]);
    $telefone = htmlspecialchars($_POST["telefone"]);
    $assunto  = $_POST["assunto"];
    $mensagem = htmlspecialchars($_POST["mensagem"]);

    // Define os e-mails de destino com base no assunto
    switch ($assunto) {
        case "cabeamento":
            $destinatarios = ["alessandro@abclan.com.br"];
            $titulo_email = "Mensagem para o setor Financeiro";
            break;
        case "telecom":
            $destinatarios = ["cpanels@abclan.com.br"];
            $titulo_email = "Mensagem com Dúvidas";
            break;
        case "outros":
            $destinatarios = ["abclantelecom@gmail.com"];
            $titulo_email = "Mensagem - Outros Assuntos";
            break;
        default:
            $destinatarios = ["abclantelecom@gmail.com"];
            $titulo_email = "Mensagem - Assunto Não Especificado";
            break;
    }

    // Monta o corpo do e-mail
    $corpo = "Nome: $nome\n";
    $corpo .= "E-mail: $email\n";
    $corpo .= "Telefone: $telefone\n\n";
    $corpo .= "Assunto: $titulo_email\n\n";
    $corpo .= "Mensagem:\n$mensagem\n";

    // Cabeçalhos do e-mail
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Envia o e-mail para cada destinatário
    $enviado = true;
    foreach ($destinatarios as $para) {
        if (!mail($para, $titulo_email, $corpo, $headers)) {
            $enviado = false;
        }
    }

    // Redireciona com base no resultado
    if ($enviado) {
        // Exibe uma página de sucesso ou redireciona
        echo "<script>alert('Mensagem enviada com sucesso!'); window.location.href = 'contato.html';</script>";
    } else {
        echo "<script>alert('Erro ao enviar mensagem. Tente novamente.'); window.history.back();</script>";
    }
} else {
    // Bloqueia acesso direto ao PHP
    echo "Acesso negado.";
}
?>
