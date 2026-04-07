<?php
session_start();
include("conexao.php");

// Verificar se o usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    header("location:login.php");
    exit;
}

// Verifica se veio o ID do carrinho
if (isset($_GET['id_carrinho'])) {
    $id_usuario = $_SESSION['id_usuario'];
    $id_carrinho = $_GET['id_carrinho'];

    try {
        // Exclui APENAS o item específico
        $cmd_delete = $pdo->prepare("
            DELETE FROM carrinho 
            WHERE id_usuario = :id_usuario 
            AND id_carrinho = :id_carrinho
        ");
        $cmd_delete->bindValue(":id_usuario", $id_usuario);
        $cmd_delete->bindValue(":id_carrinho", $id_carrinho);
        $cmd_delete->execute();

        header("Location: " . $_SERVER['HTTP_REFERER']);

    } catch (PDOException $e) {
        echo "Erro ao excluir: " . $e->getMessage();
    }
} else {
    echo "ID do carrinho não informado.";
}
?>