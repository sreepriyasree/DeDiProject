describe('Dedi API Flow - Register & Login', () => {
  const timestamp = Date.now();
  const email = `sreepriya+${timestamp}@dhiway.com`;
  const password = '1234test121234test121234test121234test121234test121234test121234test12';
  // Register account
  it('Register User', () => {
    cy.request('POST', '/dedi/register', {
      username: `sree_${timestamp}`,
      firstname: 'sreepriya',
      lastname: 'S',
      email: email,
      hashed_password: password
      
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.log("User registered successfully", JSON.stringify(response.body));
    });
  });

  });

