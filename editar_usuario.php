<?php
    include("conexao.php");

    $id_usuario = $_POST['id_usuario'];
    $nome = $_POST['nome'];
    $sobrenome = $_POST['sobrenome'];
    $email = $_POST['email'];
    $CPF = $_POST['CPF'];
    $nascimento = $_POST['nascimento'];
    $created = $_POST['created'];
    $adm_usuario = $_POST['adm_usuario'];

  

    //comando sql.
    $comando = $pdo->prepare("UPDATE usuario SET nome = :nome, sobrenome = :sobrenome, email = :email, adm_usuario = :adm_usuario WHERE id_usuario = :id_usuario");
    //Insira o comando SQL aqui.

    //insere valores das variaveis no comando sql.
    $comando->bindValue(':id_usuario',$id_usuario);
    $comando->bindValue(':nome',$nome);
    $comando->bindValue(':sobrenome',$sobrenome);
    $comando->bindValue(':email',$email);
    $comando->bindValue(':adm_usuario', $adm_usuario);
    
    

    //executa a consulta no banco de dados.
    $comando->execute();

    //Fecha declaração e conexão.
    unset($comando);
    unset($pdo);

    if($_SESSION['adm_usuario'] !=1){
        header("location:adm_usuarios.php");
    }else{
        
        header("location:informacoes_usuario.php");
    }
?>