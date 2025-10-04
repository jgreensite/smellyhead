Feature: Player join

  Scenario: A user can join as a local player and see piles
    Given the server is running
    When I open the game page
    And I click "Join as Local Player"
    Then I should see the draw pile count
