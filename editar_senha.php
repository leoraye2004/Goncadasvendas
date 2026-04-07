<?php
session_start();
    include("conexao.php");
    
    // Verificar se o usuário está logado
    if (!isset($_SESSION['id_usuario'])) {
        header("location:login.php");
        exit;
    }
    
    $id_usuario = $_SESSION['id_usuario'];
    $senha = password_hash($_POST["senha"], PASSWORD_DEFAULT);
    //comando sql.
    $comando = $pdo->prepare("UPDATE usuario SET senha = :senha WHERE id_usuario = :id_usuario");
    //Insira o comando SQL aqui.

    //insere valores das variaveis no comando sql.
    $comando->bindValue(':id_usuario',$id_usuario);
    $comando->bindValue(":senha",$senha);
    
    

    //executa a consulta no banco de dados.
    $comando->execute();

    //Fecha declaração e conexão.
    unset($comando);
    unset($pdo);

    echo "Senha alterada com sucesso";
    header("location:informacoes_usuario.php");
    
?>