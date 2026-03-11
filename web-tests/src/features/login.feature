@feature:login @regression
Feature: Login no SauceDemo
  Como usuário da plataforma SauceDemo
  Quero realizar o login com diferentes credenciais
  Para acessar ou ser impedido de acessar o sistema

  Background:
    Given que estou na página de login

  @smoke @severity:critical
  Scenario: Login com sucesso usando credenciais válidas
    When informo o usuário "standard_user" e a senha "secret_sauce"
    And clico no botão de login
    Then devo ser redirecionado para a página de inventário
    And o título da página deve ser "Products"

  @regression @severity:normal
  Scenario: Login com credenciais inválidas
    When informo o usuário "invalid_user" e a senha "wrong_password"
    And clico no botão de login
    Then devo ver uma mensagem de erro de credenciais inválidas
    And permaneço na página de login

  @regression @severity:normal
  Scenario: Login com usuário bloqueado
    When informo o usuário "locked_out_user" e a senha "secret_sauce"
    And clico no botão de login
    Then devo ver uma mensagem informando que o usuário está bloqueado
