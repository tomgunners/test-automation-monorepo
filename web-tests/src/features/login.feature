@feature:login @regression
Feature: Login no SauceDemo
  Como usuário da plataforma SauceDemo
  Quero realizar o login com diferentes credenciais
  Para acessar ou ser impedido de acessar o sistema

  Background:
    Given que estou na página de login

  @smoke @severity:critical
  Scenario: Login com sucesso usando credenciais válidas
    When informo as credenciais do "standard"
    And clico no botão de login
    Then devo ser redirecionado para a página de inventário
    And o título da página deve ser "Products"

  @regression @severity:normal
  Scenario: Login com credenciais inválidas
    When informo as credenciais do "invalid"
    And clico no botão de login
    Then devo ver uma mensagem de erro de credenciais inválidas
    And permaneço na página de login

  @regression @severity:normal
  Scenario: Login com usuário bloqueado
    When informo as credenciais do "locked"
    And clico no botão de login
    Then devo ver uma mensagem informando que o usuário está bloqueado
