<?php
    // inserir_produtos.php
    include("conexao.php");

    $nome_produto = $_POST["nome_produto"];
    $categoria = $_POST["categoria"];
    $marca = $_POST["marca"];
    $preco = $_POST["preco"];

    // Pasta onde as fotos serão salvas
    $diretorio = "imagens/";

    // Cria a pasta se ela não existir
    if (!is_dir($diretorio)) {
        mkdir($diretorio, 0755, true);
    }

    try {
        $pdo->beginTransaction();

        // ---------------------------------------------------------
        // 1. PREPARAR A FOTO DE CAPA (A primeira selecionada: índice 0)
        // ---------------------------------------------------------
        $caminho_capa = ""; 
        
        if (isset($_FILES['imagem']) && !empty($_FILES['imagem']['name'][0])) {
            // Gera um nome único para não sobrescrever fotos com mesmo nome
            $extensao = pathinfo($_FILES['imagem']['name'][0], PATHINFO_EXTENSION);
            $novo_nome = md5(uniqid(rand(), true)) . "." . $extensao;
            $destino = $diretorio . $novo_nome;

            // Move o arquivo para a pasta
            if (move_uploaded_file($_FILES['imagem']['tmp_name'][0], $destino)) {
                $caminho_capa = $destino; // Salva ex: "imagens/foto123.jpg"
            }
        }

        // ---------------------------------------------------------
        // 2. INSERIR O PRODUTO NA TABELA PRINCIPAL
        // ---------------------------------------------------------
        $comando = $pdo->prepare("INSERT INTO produtos(nome_produto, categoria, marca, preco, imagem) VALUES(:nome, :cat, :marca, :preco, :img)");

        $comando->bindValue(":nome", $nome_produto);
        $comando->bindValue(":cat", $categoria);
        $comando->bindValue(":marca", $marca);
        $comando->bindValue(":preco", $preco);
        $comando->bindValue(":img", $caminho_capa);

        $comando->execute();
        
        $id_novo_produto = $pdo->lastInsertId();

        // ---------------------------------------------------------
        // 3. SALVAR TODAS AS IMAGENS NA TABELA EXTRA (imagens_produto)
        // ---------------------------------------------------------
        if (isset($_FILES['imagem'])) {
            $total_imagens = count($_FILES['imagem']['name']);

            $cmd_extra = $pdo->prepare("INSERT INTO imagens_produto(id_produto, imagem) VALUES(:id, :caminho)");

            for ($i = 0; $i < $total_imagens; $i++) {
                if (!empty($_FILES['imagem']['name'][$i])) {
                    
                    // Gera nome único para cada foto extra
                    $ext = pathinfo($_FILES['imagem']['name'][$i], PATHINFO_EXTENSION);
                    $nome_extra = md5(uniqid(rand(), true)) . "-" . $i . "." . $ext;
                    $destino_extra = $diretorio . $nome_extra;

                    // Faz o upload
                    if (move_uploaded_file($_FILES['imagem']['tmp_name'][$i], $destino_extra)) {
                        $cmd_extra->bindValue(":id", $id_novo_produto);
                        $cmd_extra->bindValue(":caminho", $destino_extra);
                        $cmd_extra->execute();
                    }
                }
            }
        }

        $pdo->commit(); 
        header("Location: cadastro_produtos.php");

    } catch (PDOException $e) {
        $pdo->rollBack(); 
        echo "Erro ao cadastrar no banco: " . $e->getMessage();
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "Erro geral: " . $e->getMessage();
    }
?>