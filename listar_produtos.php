<?php
include("conexao.php");
$comando = $pdo->prepare("SELECT * FROM produtos" );

$comando->execute();

if ($comando->rowCount() >= 1) {
    $listaItens = $comando->fetchAll();
} else {
    echo("Não há itens cadastrados");
}

unset($comando);
unset($pdo);