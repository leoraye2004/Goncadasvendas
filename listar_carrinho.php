<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

include("conexao.php");

$id_usuario = $_SESSION['id_usuario'] ?? null;

if ($id_usuario) {

    $comando = $pdo->prepare("
        SELECT 
            cadeia.id_carrinho,
            cadeia.id_produto,
            cadeia.quantidade,
            cadeia.tamanho,
            cadeia.valor_final,
            produtos.nome_produto,
            produtos.imagem,
            produtos.preco
        FROM carrinho AS cadeia
        INNER JOIN produtos 
            ON cadeia.id_produto = produtos.id_produto 
        WHERE cadeia.id_usuario = ?
        ORDER BY cadeia.id_carrinho DESC
    ");

    $comando->execute([$id_usuario]);

    if ($comando->rowCount() > 0) {
        $listaItens = $comando->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $listaItens = [];
    }

} else {
    $listaItens = [];
}
?>