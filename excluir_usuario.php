<?php
    include("conexao.php");

    $id_usuario = $_GET['id_usuario'];
    
    //comando sql.

    $user = $pdo->prepare("DELETE FROM usuario WHERE id_usuario = :id_usuario" );
    $endereco = $pdo->prepare("DELETE FROM endereco WHERE id_usuario = :id_usuario" );
    $cartao = $pdo->prepare("DELETE FROM cartao WHERE id_usuario = :id_usuario" );
    // Insira o comando SQL aqui.

    //insere valores das variaveis no comando sql.
    $user->bindValue(':id_usuario',$id_usuario);
    $endereco->bindValue(':id_usuario',$id_usuario);
    $cartao->bindValue(':id_usuario',$id_usuario);
    
    //executa a consulta no banco de dados.
    $user->execute();
    $endereco->execute();

    //redireciona para a pagina informada.
    header("location:adm_usuarios.php");

    //Fecha declaração e conexão.
    unset($user);
    unset($endereco);
    unset($pdo);
?>