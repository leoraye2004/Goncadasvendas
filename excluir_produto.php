<?php
    include("conexao.php");

    // Verifica se veio o ID na URL (ex: excluir_produto.php?id_produto=10)
    if (isset($_GET['id_produto'])) {
        $id_produto = $_GET['id_produto'];

        try {
            // -----------------------------------------------------------
            // PASSO 1: BUSCAR E APAGAR AS FOTOS DA GALERIA (Tabela imagens_produto)
            // -----------------------------------------------------------
            $cmd_galeria = $pdo->prepare("SELECT imagem FROM imagens_produto WHERE id_produto = :id");
            $cmd_galeria->bindValue(":id", $id_produto);
            $cmd_galeria->execute();
            
            while ($foto = $cmd_galeria->fetch(PDO::FETCH_ASSOC)) {
                $caminho_relativo = $foto['imagem']; 
                
                // Converte para caminho absoluto do sistema (C:\xampp\...) para evitar erro de pasta errada
                // Substitui barras normais e invertidas para o padrão do SO
                $arquivo_fisico = __DIR__ . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $caminho_relativo);
                
                // Verifica se é um arquivo real e não um texto Base64 antigo
                if (is_file($arquivo_fisico) && file_exists($arquivo_fisico)) {
                    unlink($arquivo_fisico); 
                }
            }

            // -----------------------------------------------------------
            // PASSO 2: BUSCAR E APAGAR A CAPA (Tabela produtos)
            // -----------------------------------------------------------
            $cmd_capa = $pdo->prepare("SELECT imagem FROM produtos WHERE id_produto = :id");
            $cmd_capa->bindValue(":id", $id_produto);
            $cmd_capa->execute();
            $produto = $cmd_capa->fetch(PDO::FETCH_ASSOC);

            if ($produto) {
                $caminho_relativo_capa = $produto['imagem'];
                
                // Mesma lógica de caminho absoluto para a capa
                $arquivo_capa_fisico = __DIR__ . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $caminho_relativo_capa);

                if (is_file($arquivo_capa_fisico) && file_exists($arquivo_capa_fisico)) {
                    unlink($arquivo_capa_fisico); 
                }
            }

            // -----------------------------------------------------------
            // PASSO 3: APAGAR DO BANCO DE DADOS
            // -----------------------------------------------------------
            // Como usamos ON DELETE CASCADE no banco, ao apagar o produto, 
            // as linhas da tabela imagens_produto somem sozinhas do banco.
            $cmd_delete = $pdo->prepare("DELETE FROM produtos WHERE id_produto = :id");
            $cmd_delete->bindValue(":id", $id_produto);
            $cmd_delete->execute();

            // Volta para a página anterior (mesma página)
            header("Location: " . $_SERVER['HTTP_REFERER']);

        } catch (PDOException $e) {
            echo "Erro ao excluir: " . $e->getMessage();
        }
    } else {
        echo "ID do produto não informado.";
    }
?>