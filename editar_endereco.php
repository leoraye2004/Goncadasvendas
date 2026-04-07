<?php
session_start();
    include("conexao.php");

    // Verificar se o usuário está logado
    if (!isset($_SESSION['id_usuario'])) {
        header("location:login.php");
        exit;
    }

    $id_usuario = $_SESSION['id_usuario'];
    $cep = $_POST['cep'];
    $rua = $_POST['rua'];
    $numero = $_POST['numero'];
    $bairro = $_POST['bairro'];
    $cidade = $_POST['cidade'];
    $estado = $_POST['estado'];

    //comando sql.
    $comando = $pdo->prepare("UPDATE endereco SET cep = :cep, rua = :rua, numero = :numero, bairro = :bairro,  cidade = :cidade,  estado = :estado
     WHERE id_usuario = :id_usuario");
    //Insira o comando SQL aqui.

    //insere valores das variaveis no comando sql.
    $comando->bindValue(':id_usuario',$id_usuario);
    $comando->bindValue(':cep',$cep);
    $comando->bindValue(':rua',$rua);
    $comando->bindValue(':numero',$numero);
    $comando->bindValue(':bairro', $bairro);
    $comando->bindValue(':cidade', $cidade);
    $comando->bindValue(':estado', $estado);
    
    

    //executa a consulta no banco de dados.
    $comando->execute();

    //Fecha declaração e conexão.
    unset($comando);
    unset($pdo);

    header("location:informacoes_endereco.php");
    
?>