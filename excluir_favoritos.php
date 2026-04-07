<?php
    include("conexao.php");

    $id_produto = $_GET['id_produto'];
    
    //comando sql.

    $comando = $pdo->prepare("DELETE FROM favoritos WHERE id_produto = :id_produto");
    // Insira o comando SQL aqui.

    //insere valores das variaveis no comando sql.
    $comando->bindValue(':id_produto',$id_produto);
    
    //executa a consulta no banco de dados.
    $comando->execute();

    //redireciona para a pagina informada.
    header("location:favoritos.php");

    //Fecha declaração e conexão.
    unset($comando);
    unset($pdo);
?>