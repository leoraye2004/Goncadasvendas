<?php
session_start();
include("conexao.php");

if (!isset($_SESSION['id_usuario'])) {
    echo "Erro: selecione um tamanho!";
exit;
}

$id_usuario = $_SESSION['id_usuario'];

// ===============================
// 1. Buscar itens do carrinho
// ===============================
$sql = $pdo->prepare("
    SELECT c.*, p.nome_produto 
    FROM carrinho c
    JOIN produtos p ON c.id_produto = p.id_produto
    WHERE c.id_usuario = ?
");
$sql->execute([$id_usuario]);
$itens = $sql->fetchAll(PDO::FETCH_ASSOC);

// Se não tiver itens, não continua
if (!$itens) {
    echo "Carrinho vazio!";
    exit;
}

// ===============================
// 2. Calcular total
// ===============================
$total = 0;

foreach ($itens as $item) {
    $total += $item['valor_final'];
}

// ===============================
try {
    $pdo->beginTransaction();

    // Criar pedido
    $insertPedido = $pdo->prepare("INSERT INTO pedidos (id_usuario, total) VALUES (?, ?)");
    $insertPedido->execute([$id_usuario, $total]);

    $id_pedido = $pdo->lastInsertId();

    // Inserir itens
    foreach ($itens as $item) {
        $insertItem = $pdo->prepare("
            INSERT INTO pedidos_itens (id_pedido, id_produto, tamanho, quantidade, valor)
            VALUES (?, ?, ?, ?, ?)
        ");

        $insertItem->execute([
            $id_pedido,
            $item['id_produto'],
            $item['tamanho'],
            $item['quantidade'],
            $item['valor_final']
        ]);
    }

    $pdo->commit(); //  salva tudo

} catch (Exception $e) {
    $pdo->rollBack(); //  cancela tudo se der erro
    echo "Erro ao finalizar pedido: " . $e->getMessage();
    exit;
}

// ===============================
// 4. Montar mensagem
// ===============================
$mensagem = " *NOVO PEDIDO*\n\n";
$mensagem .= " Pedido Nº: $id_pedido\n";
$mensagem .= " Usuário ID: $id_usuario\n";
$mensagem .= " Data: " . date("d/m/Y H:i") . "\n\n";

foreach ($itens as $item) {
    $mensagem .= " *Produto:* {$item['nome_produto']}\n";
    $mensagem .= " Tamanho: {$item['tamanho']}\n";
    $mensagem .= " Quantidade: {$item['quantidade']}\n";
    $mensagem .= " Valor: R$ {$item['valor_final']}\n\n";
}

$mensagem .= "━━━━━━━━━━━━━━━\n";
$mensagem .= "💵 *TOTAL: R$ $total*";

// ===============================
// 5. Limpar carrinho
// ===============================
$delete = $pdo->prepare("DELETE FROM carrinho WHERE id_usuario = ?");
$delete->execute([$id_usuario]);

// ===============================
// 6. Enviar para WhatsApp
// ===============================
$mensagem = urlencode($mensagem);

// COLOCA SEU NÚMERO AQUI
$numero = "5547996125434";

$link = "https://wa.me/$numero?text=$mensagem";

header("Location: $link");
exit;
?>