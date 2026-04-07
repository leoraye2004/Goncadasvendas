<?php
session_start();
include("conexao.php");

if (!isset($_SESSION['id_usuario'])) {
    echo "Não logado";
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

// Mostrar todos os itens no carrinho deste usuário (mesmo sem produto correspondente)
$cmd = $pdo->prepare("SELECT cadeia.id_carrinho, cadeia.id_usuario, cadeia.id_produto, cadeia.tamanho, cadeia.quantidade, cadeia.valor_final,
                             produtos.nome_produto, produtos.imagem, produtos.preco 
                      FROM carrinho AS cadeia
                      LEFT JOIN produtos ON cadeia.id_produto = produtos.id_produto 
                      WHERE cadeia.id_usuario = ?");
$cmd->execute([$id_usuario]);
$itens = $cmd->fetchAll();

echo "<h2>Itens no carrinho do usuário $id_usuario:</h2>";
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr><th>ID</th><th>Produto</th><th>Imagem</th><th>Tamanho</th><th>Qtd</th><th>Valor</th><th>ID Produto</th><th>Ação</th></tr>";

foreach ($itens as $item) {
    echo "<tr>";
    echo "<td>" . $item['id_carrinho'] . "</td>";
    echo "<td>" . ($item['nome_produto'] ?? 'SEM PRODUTO') . "</td>";
    echo "<td>" . ($item['imagem'] ? 'SIM' : 'NÃO') . "</td>";
    echo "<td>" . $item['tamanho'] . "</td>";
    echo "<td>" . $item['quantidade'] . "</td>";
    echo "<td>R$ " . $item['valor_final'] . "</td>";
    echo "<td>" . $item['id_produto'] . "</td>";
    echo "<td><a href='admin_delete_carrinho.php?id_carrinho=" . $item['id_carrinho'] . "'>Deletar</a></td>";
    echo "</tr>";
}

echo "</table>";

// Verificar se há produtos órfãos (id_produto inválido)
echo "<h2>Produtos órfãos (sem correspondência):</h2>";
$orphans = $pdo->prepare("SELECT cadeia.id_carrinho, cadeia.id_produto 
                          FROM carrinho AS cadeia
                          LEFT JOIN produtos ON cadeia.id_produto = produtos.id_produto 
                          WHERE cadeia.id_usuario = ? AND produtos.id_produto IS NULL");
$orphans->execute([$id_usuario]);
$orphanItems = $orphans->fetchAll();

if (count($orphanItems) > 0) {
    echo "<p style='color: red;'><strong>Encontrados " . count($orphanItems) . " itens órfãos! (estes aparecem como produtos vazios no carrinho)</strong></p>";
    foreach ($orphanItems as $orphan) {
        echo "ID Carrinho: " . $orphan['id_carrinho'] . " - ID Produto: " . $orphan['id_produto'] . " <a href='admin_delete_carrinho.php?id_carrinho=" . $orphan['id_carrinho'] . "' style='color: red;'>Deletar</a><br>";
    }
    echo "<br><a href='limpar_carrinho.php' style='padding: 10px; background-color: red; color: white; text-decoration: none;'><strong>Limpar TODOS os itens órfãos automaticamente</strong></a>";
} else {
    echo "<p style='color: green;'>✓ Nenhum item órfão encontrado.</p>";
}
?>
