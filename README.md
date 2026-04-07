#  Goncadasvendas
> **E-commerce de vendas em geral**

##  Tipos de Usuários

### **Cliente**
* Visualizar produtos.
* Criar conta e fazer login.
* Adicionar produtos ao carrinho.
* Finalizar compras.
* Visualizar pedidos.

### **Administrador**
* Gerenciar produtos (CRUD).
* Gerenciar pedidos.
* Gerenciar usuários.

---

##Requisitos Funcionais

###Autenticação
* **RF01:** O sistema deve permitir cadastro de usuários.
* **RF02:** O sistema deve permitir login e logout.
* **RF03:** O sistema deve diferenciar usuários do tipo cliente e administrador.

###Produtos
* **RF04:** O administrador deve poder cadastrar produtos.
* **RF05:** O administrador deve poder editar produtos.
* **RF06:** O administrador deve poder excluir produtos.
* **RF07:** O sistema deve exibir a lista de produtos.
* **RF08:** O sistema deve exibir os detalhes de um produto.

###Carrinho e Compras
* **RF09:** O cliente deve poder adicionar produtos ao carrinho.
* **RF10:** O cliente deve poder remover produtos do carrinho.
* **RF11:** O sistema deve calcular automaticamente o valor total da compra.
* **RF12:** O cliente deve poder finalizar o pedido.

###Pedidos
* **RF13:** O sistema deve registrar pedidos realizados.
* **RF14:** O cliente deve poder visualizar seus pedidos.
* **RF15:** O administrador deve poder visualizar todos os pedidos.
* **RF16:** O administrador deve poder atualizar o status do pedido (ex: pendente, enviado).

###Usuários
* **RF17:** O administrador deve poder visualizar usuários cadastrados.
* **RF18:** O administrador deve poder excluir usuários.

---

##Requisitos Não Funcionais

* **RNF01:** O sistema deve ser responsivo, adaptando-se a diferentes tamanhos de tela (desktop e mobile).
* **RNF02:** O sistema deve garantir autenticação segura (criptografia de senhas e uso de tokens).
* **RNF03:** O sistema deve possuir proteção contra vulnerabilidades comuns (SQL Injection, XSS, CSRF).
* **RNF04:** O sistema deve apresentar bom desempenho, com tempo de resposta adequado.
* **RNF05:** A interface deve ser intuitiva e de fácil usabilidade.

http://localhost:8000/Untitled-1.php
