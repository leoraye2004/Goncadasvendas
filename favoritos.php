<?php
session_start();
include("conexao.php");
// Verifique se o usuário está logado, se não, redirecione-o para uma página de login
if(!isset($_SESSION['id_usuario']) and (!isset($_SESSION['nome']))){
    header("location:login.html");
  } 
?>


  
<!doctype html>
<html lang="pt-br">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous">
  

  <title>Use Wade!</title>

</head>

<body>
<!-- rodapé superior -->
     <nav class="navbar navbar-expand-lg navbar-dark border-bottom shadow-sm" style="background-color: #121212;">
        <div class="container-fluid">
            <div class="d-none d-md-block">
                <a href="Untitled-1.php"> <img class="pt-2" src="img/logo.png" width="150" height="120"></a>
            </div>
    
            <div class="box-search d-flex justify-content-center pt-2 col">
                <input class=" form-control me-2" type="search" placeholder="O que você está procurando?" id="pesquisar" name="pesquisar" class="">
            </div>
    
    
            <div class="align-self end ">
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse">
    
    
                    <ul class="navbar-nav">
                    
                      <?php if(!isset($_SESSION['id_usuario']) and (!isset($_SESSION['nome']))){ ?>
                        <li class="nav-item">
                            <a href="login.html" class="m-2 nav-link  text-white"> Entrar</a>
                        </li>
                        <li class="nav-item">
                            <a href="cadastro.html" class="m-2 nav-link  text-white"> Cadastrar</a>
                        </li>
                        <?php }else{ ?>
                          <li class="nav-item">
                            <a href="informacoes_usuario.php" class="m-2 nav-link  text-white"> Bem vindo <?php echo $_SESSION['nome']; ?></a>
                        </li>
                        <?php } ?>
    
                        <li class="nav-item"> 
                          <a class="btn btn- m-2  nav-link text-white" data-bs-toggle="offcanvas" href="#offcanvasRight" role="button" aria-controls="offcanvasRight">
                                <img src="img/bi_person.png" height="28">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>
    </nav>

    
    
    <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div class="offcanvas-header">
          <h5 id="offcanvasRightLabel">WadeClub</h5>
              <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                  aria-label="Close"></button>
        </div>
        <div class=" offcanvas-body border">
        <?php 
                if(!isset($_SESSION['id_usuario']) and (!isset($_SESSION['nome']))){ 
                  
                  }else{
                    if ($_SESSION['adm_usuario'] != 1){ 
              
                  }else { ?>
                    <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-kiss" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M12.493 13.368a7 7 0 1 1 2.489-4.858c.344.033.68.147.975.328a8 8 0 1 0-2.654 5.152 8.58 8.58 0 0 1-.81-.622Zm-3.731-3.22a13 13 0 0 0-1.107.318.5.5 0 1 1-.31-.95c.38-.125.802-.254 1.192-.343.37-.086.78-.153 1.103-.108.16.022.394.085.561.286.188.226.187.497.131.705a1.892 1.892 0 0 1-.31.593c-.077.107-.168.22-.275.343.107.124.199.24.276.347.142.197.256.397.31.595.055.208.056.479-.132.706-.168.2-.404.262-.563.284-.323.043-.733-.027-1.102-.113a14.87 14.87 0 0 1-1.191-.345.5.5 0 1 1 .31-.95c.371.12.761.24 1.109.321.176.041.325.069.446.084a5.609 5.609 0 0 0-.502-.584.5.5 0 0 1 .002-.695 5.52 5.52 0 0 0 .5-.577 4.465 4.465 0 0 0-.448.082Zm.766-.087-.003-.001-.003-.001c.004 0 .006.002.006.002Zm.002 1.867-.006.001a.038.038 0 0 1 .006-.002ZM6 8c.552 0 1-.672 1-1.5S6.552 5 6 5s-1 .672-1 1.5S5.448 8 6 8Zm2.757-.563a.5.5 0 0 0 .68-.194.934.934 0 0 1 .813-.493c.339 0 .645.19.813.493a.5.5 0 0 0 .874-.486A1.934 1.934 0 0 0 10.25 5.75c-.73 0-1.356.412-1.687 1.007a.5.5 0 0 0 .194.68ZM14 9.828c1.11-1.14 3.884.856 0 3.422-3.884-2.566-1.11-4.562 0-3.421Z"/>
                      </svg><a href="tela_adm.php" class="text-reset text-decoration-none"> Administrador</a>
                  </p> 
              <?php
                  }
                }
              ?>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                      d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                  <path fill-rule="evenodd"
                      d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
              </svg><a href="Untitled-1.php" class="text-reset text-decoration-none"> Inicio</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-cart4" viewBox="0 0 16 16">
                  <path
                      d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l.5 2H5V5H3.14zM6 5v2h2V5H6zm3 0v2h2V5H9zm3 0v2h1.36l.5-2H12zm1.11 3H12v2h.61l.5-2zM11 8H9v2h2V8zM8 8H6v2h2V8zM5 8H3.89l.5 2H5V8zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
              </svg><a href="carrinho.php" class="text-reset text-decoration-none"> Minhas compras</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path
                      d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
              </svg><a href="favoritos.php" class="text-reset text-decoration-none"> Favoritos </a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-gift" viewBox="0 0 16 16">
                  <path
                      d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
              </svg><a href="Untitled-1.php" class="text-reset text-decoration-none"> Promoções</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-credit-card" viewBox="0 0 16 16">
                  <path
                      d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
                  <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
              </svg><a href="cartoes.php" class="text-reset text-decoration-none"> Cartões salvos</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-signpost-split-fill" viewBox="0 0 16 16">
                  <path
                      d="M7 16h2V6h5a1 1 0 0 0 .8-.4l.975-1.3a.5.5 0 0 0 0-.6L14.8 2.4A1 1 0 0 0 14 2H9v-.586a1 1 0 0 0-2 0V7H2a1 1 0 0 0-.8.4L.225 8.7a.5.5 0 0 0 0 .6l.975 1.3a1 1 0 0 0 .8.4h5v5z" />
              </svg><a href="informacoes_endereco.php" class="text-reset text-decoration-none"> Endereços</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                  <path
                      d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z" />
              </svg><a href="informacoes_usuario.php" class="text-reset text-decoration-none"> Meus dados</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                      d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                  <path fill-rule="evenodd"
                      d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
              </svg><a href="sair.php" class="text-reset text-decoration-none">Sair</a></p>
    
          <hr>
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
                  <path
                      d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
              </svg><a href="" class="text-reset text-decoration-none"> Trocas e devoluçôes</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path
                      d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
              </svg><a href="" class="text-reset text-decoration-none"> Ajuda</a></p>
    
          <p class="fs-5 text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  fill="currentColor" class="bi bi-braces" viewBox="0 0 16 16">
                  <path
                      d="M2.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C3.25 2 2.49 2.759 2.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6zM13.886 7.9v.163c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456V7.332c-1.114 0-1.49-.362-1.49-1.456V4.352C13.51 2.759 12.75 2 11.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6z" />
              </svg><a href="" class="text-reset text-decoration-none"> Sobre WadeClub </a></p>
    
        </div>
    </div>
<!----  ------->

<!-- menu de pesquisa: home, categoria, fav. carrinho -->
  <ul class="sticky-top nav nav-pills nav-fill navbar-light bg-light border">
      <li class="nav-item d-none d-md-block">
          <a class="nav-link " aria-current="page" href="Untitled-1.php" tabindex="-1" aria-disabled="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house"
                  viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                      d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                  <path fill-rule="evenodd"
                      d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
              </svg><strong>Home</strong></a>
      </li>
      <li class="nav-item d-none d-md-block">
          
          <a class="nav-link" href="categoria.php"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ui-radios-grid" viewBox="0 0 16 16">
              <path d="M3.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm9-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM16 3.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm-9 9a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm5.5 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-9-11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
            </svg>
          <strong>Categoria</strong></a>
      </li>
      <li class="nav-item d-none d-md-block">
          <a class="nav-link" href="favoritos.php">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart"
                  viewBox="0 0 16 16">
                  <path
                      d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
              </svg><strong>Lista de desejos</strong></a>
      </li>
      <li class="nav-item d-none d-md-block">
          <a class="nav-link " href="Carrinho.php" tabindex="-1" aria-disabled="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cart3"
                  viewBox="0 0 16 16">
                  <path
                      d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg><strong>Carrinho</strong> </a>
      </li>

      <li class="nav-item d-inline-block d-md-none">
          <a class="nav-link disabled" aria-current="page" href="#" tabindex="-1" aria-disabled="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-house"
                  viewBox="0 0 16 16">
                  <path fill-rule="evenodd"
                      d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                  <path fill-rule="evenodd"
                      d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
              </svg></a>
      </li>
      <li class="nav-item d-inline-block d-md-none">
          <a class="nav-link text-dark" href="#">

              <a class="nav-link text-dark" href="#"><img id="chuteira-icon" src="img/vans-svgrepo-com.svg" class="bi " width="20" height="20" ></a>
      </li>
      <li class="nav-item d-inline-block d-md-none">
          <a class="nav-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart"
                  viewBox="0 0 16 16">
                  <path
                      d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
              </svg></a>
      </li>
      <li class="nav-item d-inline-block d-md-none">
          <a class="nav-link " href="#" tabindex="-1" aria-disabled="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cart3"
                  viewBox="0 0 16 16">
                  <path
                      d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg> </a>
      </li>
      


  </ul>
  <!----  ------->
  
  
  
      <main>


        <section class="h-100 h-custom">
            <div class="container py-5 h-100">
                <div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col-8">
                        <div class="card card-registration card-registration-2 shadow border border-3"
                            style="border-radius: 15px;">
                            <div class="card-body p-0">
                                <div class="row g-0">
                                    <div class="col">
                                        <div class="p-5">
                                            <div class="d-flex justify-content-between align-items-center mb-5">
                                                <h2 class="fw-bold mb-0 text-black">Seus favoritos</h2>
                                            </div>
                                            <?php 
                                                include("listar_favoritos.php");

                                                if (!empty($listaItens)) {
                                                    foreach($listaItens as $linha) { 
                                                    
                                            ?>
                                            <hr class="my-4">

                                            <div class="row mb-4 d-flex justify-content-between align-items-center">
                                                <div class="col-md-2 col-lg-2 col-xl-2">
                                                    <img height="100%" width="100%" class=""
                                                        src="<?php echo $linha['imagem'];?>">

                                                </div>
                                                <div class="col-md-3 col-lg-3 col-xl-3">
                                                    <h5 class="text-black mb-0">
                                                        <?php echo $linha['nome_produto'];?>
                                                    </h5>
                                                </div>
                                                <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                                    <h7 class="mb-0 text-muted">R$
                                                        <?php echo $linha['preco'];?>
                                                    </h7>
                                                </div>
                                                <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                                    <a href="produto.php?id_produto=<?php echo $linha['id_produto'];?>">
                                                        <button type="button" class="btn btn-outline"
                                                            data-bs-toggle="tooltip" data-bs-placement="top"
                                                            title="Comprar">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20"
                                                                height="20" fill="currentColor" class="bi bi-cart4"
                                                                viewBox="0 0 16 16">
                                                                <path
                                                                    d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l.5 2H5V5H3.14zM6 5v2h2V5H6zm3 0v2h2V5H9zm3 0v2h1.36l.5-2H12zm1.11 3H12v2h.61l.5-2zM11 8H9v2h2V8zM8 8H6v2h2V8zM5 8H3.89l.5 2H5V8zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                                                            </svg>
                                                        </button>
                                                    </a>
                                                </div>
                                                <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                                                    <a
                                                        href="excluir_favoritos.php?id_produto=<?php echo $linha['id_produto'];?>">
                                                        <button type="button" class="btn btn-outline"
                                                            data-bs-toggle="tooltip" data-bs-placement="top"
                                                            title="Excluir dos favoritos">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16"
                                                                height="16" fill="red" class="danger bi bi-trash"
                                                                viewBox="0 0 16 16">
                                                                <path
                                                                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                                <path fill-rule="evenodd"
                                                                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                            </svg>
                                                        </button>
                                                    </a>
                                                </div>
                                            </div>
                                            <?php }} ?>





                                            <hr class="my-4">

                                            <div class="pt-3">
                                                <h6 class="mb-0"><a href="untitled-1.php" class="text-body">
                                                        <- voltar </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  <footer class="border-top text-muted bg-light mt-auto">
  <div class="container">
    <div class="row py-3 align-items-center">

      <div class="col-12 col-md-4 text-center text-md-start">
        &copy; 2026 - Goncadasvendas
      </div>

      <div class="col-12 col-md-4 text-center">
        <a href="#" class="text-decoration-none text-dark">
          Política de privacidade
        </a>
      </div> 

      <div class="col-12 col-md-4 text-center text-md-end">
        <?php 
        if (!isset($_SESSION["id_usuario"]) && !isset($_SESSION["nome"])) {
            echo '<a href="#" class="text-decoration-none text-dark">Termos de uso</a>';
        } else {
            if ($_SESSION["adm_usuario"] != 1) {
                echo '<a href="#" class="text-decoration-none text-dark">Termos de uso</a>';
            } else {
                echo '<a href="tela_adm.php" class="text-decoration-none text-dark">Administrador</a>';
            }
        } 
        ?>
      </div>

    </div>
  </div>
</footer>
  

  <!-- Optional JavaScript -->
  <!-- Popper.js first, then Bootstrap JS -->
 

 <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"
        integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous">
        </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.min.js"
        integrity="sha384-7VPbUDkoPSGFnVtYi0QogXtr74QeVeeIs99Qfg5YCF+TidwNdjvaKZX19NZ/e6oz" crossorigin="anonymous">
        </script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
        integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
        crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/js/bootstrap.min.js"
        integrity="sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/"
        crossorigin="anonymous"></script>
    <script>

        var search = document.getElementById('pesquisar');

        search.addEventListener("keydown", function(event){
            if (event.key === "Enter")
            {
                searchData();
            }
        });

        function searchData()
        {
            window.location = 'categoria.php?search='+search.value;
        }
    </script>
    
</body>
</html>