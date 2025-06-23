describe('Dedi API Login Only - Static User', () => {
  it('Login with static registered user', () => {
    const email =  'sreepriya+test1@dhiway.com';
    const hashed_password = 'password1234passwordpassword1234passwordpassword1234passwordpassword1234passwordpassword1234password';
    cy.request({
      method: 'POST',
      url: '/dedi/login',
      body: { email, hashed_password },
      failOnStatusCode: false // allows debugging on failure
      
    }).then((response) => {
      cy.log('Login Status:', response.status);
      cy.log('Login Response:', JSON.stringify(response.body, null, 2));

      expect([200, 201]).to.include(response.status);

      const token = response.body.data?.access_token;
      expect(token, 'Access token should be present').to.exist;

      cy.log('Access Token:', token);
      Cypress.env('accessToken', token); // Optional: Save for other tests
    });
  });
});

