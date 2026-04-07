<?php
session_start();
include("conexao.php");

if (!isset($_SESSION['id_usuario'])) {
    header("location:login.php");
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

try {
    // Deletar todos os itens órfãos (produtos que não existem mais)
    $cmd = $pdo->prepare("DELETE FROM carrinho 
                          WHERE id_usuario = ? 
                          AND id_produto NOT IN (SELECT id_produto FROM produtos)");
    $cmd->execute([$id_usuario]);
    
    $deletados = $cmd->rowCount();
    
    echo "<h2>Limpeza do carrinho concluída!</h2>";
    echo "<p>$deletados itens órfãos foram removidos.</p>";
    echo "<a href='carrinho.php'>Voltar ao carrinho</a>";
    
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>
