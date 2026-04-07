<?php
session_start();

$dados = filter_input_array(INPUT_POST, FILTER_DEFAULT);
include_once("conexao.php");

    if(!empty($dados['sendlogin'])){
    $query_usuario = "SELECT * FROM usuario WHERE email =:email LIMIT 1";
    $result_usuario = $pdo->prepare($query_usuario);
    $result_usuario->bindParam(':email', $dados['email']);
    
    $result_usuario->execute();
    

    if(($result_usuario) AND ($result_usuario->rowCount() != 0 )){
        $row_usuario = $result_usuario->fetch(PDO::FETCH_ASSOC);
        if(password_verify($dados['senha'], $row_usuario['senha'])){
            $_SESSION['id_usuario'] = $row_usuario['id_usuario'];
            $_SESSION['nome'] = $row_usuario['nome'];
            $_SESSION['sobrenome'] = $row_usuario['sobrenome'];
            $_SESSION['email'] = $row_usuario['email'];
            $_SESSION['nascimento'] = $row_usuario['nascimento'];
            $_SESSION['CPF'] = $row_usuario['CPF'];
            $_SESSION['adm_usuario'] = $row_usuario['adm_usuario'];
            $_SESSION['loggedin'] = true; 

            if($_SESSION['adm_usuario']  !=1){
                header("location: untitled-1.php");
            }else{
                header("location: tela_adm.php");
            }
            
            
        }else{
            $_SESSION['msg'] ="Erro: Email ou senha inválido!";

        }
    }else{
        $_SESSION['msg'] ="Erro: Email ou senha inválido!";

    }
    if(isset($_SESSION['msg'])){
        echo $_SESSION['msg'];
        unset($_SESSION['msg']);
    }

    
    }

?>