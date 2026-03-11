@feature:carrinho @regression
Feature: Gerenciamento do Carrinho de Compras
  Como usuário autenticado no SauceDemo
  Quero gerenciar os itens do meu carrinho de compras
  Para controlar minha lista de produtos antes do checkout

  Background:
    Given que estou logado com o usuário "standard_user" e senha "secret_sauce"
    And estou na página de inventário

  @smoke @severity:critical
  Scenario: Adicionar produto ao carrinho
    When adiciono o produto "Sauce Labs Backpack" ao carrinho
    Then o badge do carrinho deve exibir "1"
    And o produto "Sauce Labs Backpack" deve estar no carrinho

  @regression @severity:normal
  Scenario: Remover produto do carrinho
    Given já adicionei o produto "Sauce Labs Backpack" ao carrinho
    When removo o produto "Sauce Labs Backpack" do carrinho
    Then o badge do carrinho não deve ser exibido
    And o carrinho deve estar vazio

  @regression @severity:normal
  Scenario: Validar quantidade de itens no carrinho
    When adiciono o produto "Sauce Labs Backpack" ao carrinho
    And adiciono o produto "Sauce Labs Bike Light" ao carrinho
    Then o badge do carrinho deve exibir "2"
    And o carrinho deve conter 2 itens
