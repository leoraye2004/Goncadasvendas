<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

include("conexao.php");

$id_usuario = $_SESSION['id_usuario'] ?? null;

if ($id_usuario) {
    $comando = $pdo->prepare("SELECT * FROM favoritos 
        RIGHT JOIN produtos ON favoritos.id_produto = produtos.id_produto 
        WHERE favoritos.id_usuario = ?");
    $comando->execute([$id_usuario]);

    if ($comando->rowCount() >= 1) {
        $listaItens = $comando->fetchAll();
        // Exibir os produtos aqui
    } else {
        echo "Você não adicionou itens como favoritos.";
    }
} else {
    echo "Usuário não autenticado.";
}
