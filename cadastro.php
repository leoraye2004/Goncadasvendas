<?php
    include("conexao.php");

    $email = $_POST["email"];
    $senha = password_hash($_POST["senha"], PASSWORD_DEFAULT);
    $nome = $_POST["nome"];
    $sobrenome = $_POST["sobrenome"];
    $CPF = $_POST["CPF"];
    $nascimento = $_POST["nascimento"];
    $cep = $_POST["cep"];
    $rua = $_POST["rua"];
    $numero = $_POST["numero"];
    $bairro = $_POST["bairro"];
    $cidade = $_POST["cidade"];
    $estado = $_POST["estado"];

   
    $query_usuario = "INSERT INTO usuario (email, senha, nome, sobrenome, CPF, nascimento, created)
     VALUES(:email, :senha, :nome, :sobrenome, :CPF, :nascimento, NOW())";
    
    $cad_usuario = $pdo -> prepare($query_usuario);
    $cad_usuario->bindValue(":email",$email);                                     
    $cad_usuario->bindValue(":senha",$senha); 
    $cad_usuario->bindValue(":nome",$nome);
    $cad_usuario->bindValue(":sobrenome",$sobrenome);
    $cad_usuario->bindValue(":CPF",$CPF);
    $cad_usuario->bindValue(":nascimento",$nascimento);
    $cad_usuario->execute(); 
    // recupera ultimo id.
    $id_usuario = $pdo->lastInsertId();

    $query_endereco = "INSERT INTO endereco (cep, rua, numero, bairro, cidade, estado, id_usuario)
     VALUES (:cep, :rua, :numero, :bairro, :cidade, :estado, :id_usuario)";
    $cad_endereco = $pdo -> prepare($query_endereco);
    $cad_endereco->bindValue(":cep",$cep);
    $cad_endereco->bindValue(":rua",$rua);
    $cad_endereco->bindValue(":numero",$numero);
    $cad_endereco->bindValue(":bairro",$bairro);
    $cad_endereco->bindValue(":cidade",$cidade);
    $cad_endereco->bindValue(":estado",$estado);
    $cad_endereco->bindValue(":id_usuario", $id_usuario);   
                   
    $cad_endereco->execute();               

    header("Location:login.html");

    unset($cad_usuario);
    unset($cad_endereco);
    unset($pdo);
?>