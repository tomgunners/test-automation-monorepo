@feature:checkout @regression
Feature: Finalização de Compra (Checkout)
  Como usuário autenticado no SauceDemo
  Quero finalizar minhas compras no checkout
  Para concluir meu pedido ou ser avisado de campos obrigatórios

  Background:
    Given que estou logado com o usuário "standard_user" e senha "secret_sauce"
    And adicionei o produto "Sauce Labs Backpack" ao carrinho
    And naveguei para o carrinho
    And cliquei em "Checkout"

  @smoke @severity:critical
  Scenario: Finalizar compra com sucesso
    When preencho o primeiro nome "João"
    And preencho o sobrenome "Silva"
    And preencho o CEP "01310-100"
    And clico em "Continue"
    And clico em "Finish"
    Then devo ver a tela de confirmação do pedido
    And a mensagem de confirmação deve ser "Thank you for your order!"

  @regression @severity:normal
  Scenario: Tentar finalizar sem preencher o primeiro nome
    When deixo o primeiro nome em branco
    And preencho o sobrenome "Silva"
    And preencho o CEP "01310-100"
    And clico em "Continue"
    Then devo ver um erro informando que o primeiro nome é obrigatório

  @regression @severity:normal
  Scenario: Tentar finalizar sem preencher nenhum campo
    When clico em "Continue" sem preencher nenhum campo
    Then devo ver um erro informando que o primeiro nome é obrigatório
