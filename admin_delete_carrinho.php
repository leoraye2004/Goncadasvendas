<?php
session_start();
include("conexao.php");

// Verificar se o usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    header("location:login.php");
    exit;
}

// Verifica se veio o ID do carrinho na URL
if (isset($_GET['id_carrinho'])) {
    $id_usuario = $_SESSION['id_usuario'];
    $id_carrinho = $_GET['id_carrinho'];

    try {
        // Primeira, verificar se o item pertence ao usuário (segurança)
        $verify = $pdo->prepare("SELECT id_usuario FROM carrinho WHERE id_carrinho = ?");
        $verify->execute([$id_carrinho]);
        $result = $verify->fetch();

        if ($result && $result['id_usuario'] == $id_usuario) {
            // Exclui o item do carrinho
            $cmd_delete = $pdo->prepare("DELETE FROM carrinho WHERE id_carrinho = ?");
            $cmd_delete->execute([$id_carrinho]);
            
            echo "Item removido com sucesso!";
            header("Refresh: 2; url=carrinho.php");
        } else {
            echo "Erro: Item não encontrado ou não pertence a você.";
        }

    } catch (PDOException $e) {
        echo "Erro ao excluir: " . $e->getMessage();
    }
} else {
    echo "ID do carrinho não informado.";
}
?>
