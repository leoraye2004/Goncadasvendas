<?php

include("conexao.php");

$id_produto = isset($_GET['id_produto']) ? $_GET['id_produto'] : (isset($_POST['id_produto']) ? $_POST['id_produto'] : null);

$comando = $pdo->prepare("SELECT * FROM produtos WHERE id_produto = ?");

$comando->execute([$id_produto]);

if ($comando->rowCount() >= 1) {
    $listaItens = $comando->fetchAll();
    
    
} else {
    echo("Não há itens cadastradosss");
}
