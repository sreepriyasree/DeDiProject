it('Negative test: Login, Namespace, Registry, and Record failures', () => {
  cy.log('🔴 Starting negative cases...');
  Cypress.env('accessToken', 'invalidtoken12345');  // Provide dummy token for negative tests

  // 1️⃣ Negative login with invalid credentials
  cy.request({
    method: 'POST',
    url: '/dedi/login',
    body: { email: 'invalid@example.com', hashed_password: 'wrongpassword' },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('🔴 Invalid Login Status:', response.status);
    cy.log('🔴 Invalid Login Response:', JSON.stringify(response.body, null, 2));
    expect(response.status, 'Invalid login should return 4xx').to.be.within(400, 499);
    expect(response.body.message || response.body.error, 'Error message should be present').to.exist;
  });

  // 2️⃣ Negative namespace creation with invalid token
  cy.request({
    method: 'POST',
    url: '/dedi/create-namespace',
    headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
    body: { name: `invalid-namespace-${Date.now()}`, description: 'Invalid namespace', meta: {} },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('🔴 Invalid Namespace Creation Status:', response.status);
    cy.log('🔴 Invalid Namespace Creation Response:', JSON.stringify(response.body, null, 2));
    expect(response.status, 'Invalid namespace should return 4xx').to.be.within(400, 499);
    expect(response.body.message || response.body.error, 'Error message should be present').to.exist;
  });

  // 3️⃣ Negative registry creation with invalid namespace
  cy.request({
    method: 'POST',
    url: `/dedi/invalid-namespace-id/create-registry`,
    headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
    body: {
      registry_name: `invalid-registry-${Date.now()}`,
      description: 'Invalid registry',
      schema: {},
      query_allowed: true,
      meta: {},
    },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('🔴 Invalid Registry Creation Status:', response.status);
    cy.log('🔴 Invalid Registry Creation Response:', JSON.stringify(response.body, null, 2));
    expect(response.status, 'Invalid registry should return 4xx').to.be.within(400, 499);
    expect(response.body.message || response.body.error, 'Error message should be present').to.exist;
  });

  // 4️⃣ Negative record creation with invalid registry
  const namespaceId = Cypress.env('namespaceId') || 'invalid-namespace-id';  // fallback to invalid
  cy.request({
    method: 'POST',
    url: `/dedi/${encodeURIComponent(namespaceId)}/nonexistent-registry/add-record`,
    headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
    body: {
      record_name: `invalid-record-${Date.now()}`,
      description: 'Invalid record',
      details: {},
      meta: {},
    },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('🔴 Invalid Record Creation Status:', response.status);
    cy.log('🔴 Invalid Record Creation Response:', JSON.stringify(response.body, null, 2));
    expect(response.status, 'Invalid record should return 4xx').to.be.within(400, 499);
    expect(response.body.message || response.body.error, 'Error message should be present').to.exist;
  });
});
it('Valid login, but invalid namespace , record and registry creation (missing required fields)', () => {
  const email = 'sreepriya+test1@dhiway.com';
  const hashed_password = 'password1234passwordpassword1234passwordpassword1234passwordpassword1234passwordpassword1234password';

  cy.log('🔵 Logging in with valid credentials...');
  cy.request({
    method: 'POST',
    url: '/dedi/login',
    body: { email, hashed_password },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('🔵 Login Status:', response.status);
    cy.log('🔵 Login Response:', JSON.stringify(response.body, null, 2));

    expect([200, 201]).to.include(response.status);
    const accessToken = response.body.data?.access_token;
    expect(accessToken, 'Access token should be present').to.exist;

    cy.log('✅ Valid login succeeded. Now sending invalid namespace payload...');

    // 2️⃣ Attempt invalid namespace creation (missing `name` field)
    cy.request({
      method: 'POST',
      url: '/dedi/create-namespace',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        // Intentionally omit 'name'
        description: 'Invalid namespace without name',
        meta: {},
      },
      failOnStatusCode: false,
    }).then((nsResponse) => {
      cy.log('🔴 Invalid Namespace Creation Status:', nsResponse.status);
      cy.log('🔴 Invalid Namespace Creation Response:', JSON.stringify(nsResponse.body, null, 2));

      // Expect 4xx failure because 'name' is required
      expect(nsResponse.status, 'Namespace creation should fail with 4xx').to.be.within(400, 499);
      expect(nsResponse.body.message || nsResponse.body.error, 'Error message should be present').to.exist;

      cy.log('✅ Server rejected invalid namespace creation as expected.');
  

    // 1️⃣ Create a valid namespace so we can test invalid registry/record within it
    const namespace_name = `valid-namespace-${Date.now()}`;
    cy.request({
      method: 'POST',
      url: '/dedi/create-namespace',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        name: namespace_name,
        description: 'Valid namespace for invalid registry/record tests',
        meta: {},
      },
      failOnStatusCode: false,
    }).then((nsResponse) => {
      cy.log('✅ Namespace Creation Status:', nsResponse.status);
      cy.log('✅ Namespace Creation Response:', JSON.stringify(nsResponse.body, null, 2));

      expect([200, 201]).to.include(nsResponse.status);
      const namespaceId = nsResponse.body.data?.namespace_id;
      expect(namespaceId, 'Namespace ID should be present').to.exist;

      cy.log('✅ Namespace created successfully, now testing invalid registry creation...');

      // 2️⃣ Attempt invalid registry creation: missing required field 'registry_name'
      cy.request({
        method: 'POST',
        url: `/dedi/${encodeURIComponent(namespaceId)}/create-registry`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {
          // registry_name is missing on purpose
          description: 'Invalid registry missing required field',
          schema: {},
          query_allowed: true,
          meta: {},
        },
        failOnStatusCode: false,
      }).then((regResponse) => {
        cy.log('🔴 Invalid Registry Creation Status:', regResponse.status);
        cy.log('🔴 Invalid Registry Creation Response:', JSON.stringify(regResponse.body, null, 2));

        expect(regResponse.status, 'Invalid registry should fail with 4xx').to.be.within(400, 499);
        expect(regResponse.body.message || regResponse.body.error, 'Error message should be present').to.exist;

        cy.log('✅ Server rejected invalid registry creation as expected.');

        // 3️⃣ Attempt invalid record creation: using nonexistent registry name
        const invalidRegistry = `nonexistent-registry-${Date.now()}`;
        cy.request({
          method: 'POST',
          url: `/dedi/${encodeURIComponent(namespaceId)}/${encodeURIComponent(invalidRegistry)}/add-record`,
          headers: { Authorization: `Bearer ${accessToken}` },
          body: {
            record_name: `invalid-record-${Date.now()}`,
            description: 'Invalid record in nonexistent registry',
            details: {},
            meta: {},
          },
          failOnStatusCode: false,
        }).then((recResponse) => {
          cy.log('🔴 Invalid Record Creation Status:', recResponse.status);
          cy.log('🔴 Invalid Record Creation Response:', JSON.stringify(recResponse.body, null, 2));

          expect(recResponse.status, 'Invalid record should fail with 4xx').to.be.within(400, 499);
          expect(recResponse.body.message || recResponse.body.error, 'Error message should be present').to.exist;

          cy.log('✅ Server rejected invalid record creation as expected.');
        });
      });
    });
  });
});
});
