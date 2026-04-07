<?php
session_start();
include("conexao.php");

if (!isset($_SESSION['id_usuario'])) {
    header("location:login.html");
    exit;
}

$id_produto = $_POST["id_produto"];
$tamanho = $_POST["tamanho"] ?? null;

if (empty($tamanho)) {
    echo "Erro: selecione um tamanho!";
    exit;
}
$quantidade = $_POST["quantidade"];
$id_usuario = $_SESSION['id_usuario'];

// Buscar preço
$query = $pdo->prepare("SELECT preco FROM produtos WHERE id_produto = ?");
$query->execute([$id_produto]);

if ($query->rowCount() > 0) {

    $linha = $query->fetch(PDO::FETCH_ASSOC);
    $valor_final = $linha['preco'] * $quantidade;

    // Verifica se já existe no carrinho
    $check = $pdo->prepare("SELECT id_carrinho, quantidade FROM carrinho 
                            WHERE id_usuario = ? AND id_produto = ? AND tamanho = ?");
    $check->execute([$id_usuario, $id_produto, $tamanho]);

    if ($check->rowCount() > 0) {

        $item = $check->fetch(PDO::FETCH_ASSOC);
        $nova_quantidade = $item['quantidade'] + $quantidade;
        $novo_valor = $linha['preco'] * $nova_quantidade;

        $update = $pdo->prepare("UPDATE carrinho 
                                SET quantidade = ?, valor_final = ? 
                                WHERE id_carrinho = ?");
        $update->execute([$nova_quantidade, $novo_valor, $item['id_carrinho']]);

    } else {

        $insert = $pdo->prepare("
            INSERT INTO carrinho 
            (id_usuario, id_produto, tamanho, quantidade, valor_final)
            VALUES (?, ?, ?, ?, ?)
        ");

        $insert->execute([$id_usuario, $id_produto, $tamanho, $quantidade, $valor_final]);
    }

    header("location:carrinho.php");
    exit;

} else {
    echo "Produto não encontrado";
}
?>