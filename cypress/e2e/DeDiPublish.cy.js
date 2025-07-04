describe('Dedi API Login, Create Namespace, Registry, and Record - Static User', () => {

  it('Login with static registered user', () => {
    const email = 'sreepriya+test1@dhiway.com';
    const hashed_password = 'password1234passwordpassword1234passwordpassword1234passwordpassword1234passwordpassword1234password';
    
    cy.request({
      method: 'POST',
      url: '/dedi/login',
      body: { email, hashed_password },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log('Login Status:', response.status);
      cy.log('Login Response:', JSON.stringify(response.body, null, 2));

      expect([200, 201]).to.include(response.status);
      expect(response.status, 'Response status should not be 0').to.not.eq(0);

      const token = response.body.data?.access_token;
      expect(token, 'Access token should be present').to.exist;

      cy.log('Access Token:', token);
      Cypress.env('accessToken', token);
    });
  });

  it('Create namespace with access token', () => {
    const timestamp = Date.now();
    const namespace_name = `test-namespace-${timestamp}`;
    const namespace_desc = 'This is a test namespace created via Cypress';

    const accessToken = Cypress.env('accessToken');
    expect(accessToken, 'Access token should be set').to.exist;

    cy.request({
      method: 'POST',
      url: '/dedi/create-namespace',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        name: namespace_name,
        description: namespace_desc,
        meta: {
          additionalProp1: {},
        },
      },
      failOnStatusCode: false,
    }).then((response) => {
      cy.log('Namespace Creation Status:', response.status);
      cy.log('Namespace Creation Response:', JSON.stringify(response.body, null, 2));

      expect([200, 201]).to.include(response.status);
      expect(response.status, 'Response status should not be 0').to.not.eq(0);

      const namespaceId = response.body.data?.namespace_id;
      expect(namespaceId, 'Namespace ID should be present').to.exist;

      cy.log(`✅ Namespace created successfully: ${namespaceId}`);
      Cypress.env('namespaceId', namespaceId);
    });
  });

  

  it('Create registry under namespace', () => {
  const accessToken = Cypress.env('accessToken');
  const namespaceId = Cypress.env('namespaceId');
  expect(accessToken, 'Access token should be set').to.exist;
  expect(namespaceId, 'Namespace ID should be set').to.exist;

  const timestamp = Date.now();
  const registry_name = `test-registry-${timestamp}`;
  const registry_desc = 'This is a test registry created via Cypress';

  cy.request({
    method: 'POST',
    url: `/dedi/${encodeURIComponent(namespaceId)}/create-registry`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      registry_name: registry_name,
      description: registry_desc,
      schema: {
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string",
      },
      query_allowed: true,
      meta: {
        additionalProp1: {},
      },
    },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('Registry Creation Status:', response.status);
    cy.log('Registry Creation Response:', JSON.stringify(response.body, null, 2));

    expect([200, 201]).to.include(response.status);
    expect(response.status, 'Response status should not be 0').to.not.eq(0);

    cy.log(`✅ Registry created successfully: ${registry_name}`);
    Cypress.env('registryName', registry_name);  // Save the registry name YOU generated
  });
});
it('Create record under registry', () => {
  const accessToken = Cypress.env('accessToken');
  const namespaceId = Cypress.env('namespaceId');
  const registryName = Cypress.env('registryName');
  expect(accessToken, 'Access token should be set').to.exist;
  expect(namespaceId, 'Namespace ID should be set').to.exist;
  expect(registryName, 'Registry name should be set').to.exist;

  const timestamp = Date.now();
  const rec_name = `test-record-${timestamp}`;
  const rec_desc = 'This is a test record created via Cypress';

  cy.request({
    method: 'POST',
    url: `/dedi/${encodeURIComponent(namespaceId)}/${encodeURIComponent(registryName)}/add-record`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      record_name: rec_name,
      description: rec_desc,
      details: {
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string",
      },
      meta: {
        additionalProp1: {},
      },
    },
    failOnStatusCode: false,
  }).then((response) => {
    cy.log('Record Creation Status:', response.status);
    cy.log('Record Creation Response:', JSON.stringify(response.body, null, 2));

    expect([200, 201]).to.include(response.status);
    expect(response.status, 'Response status should not be 0').to.not.eq(0);

    const recordId = response.body.data?.record_id;
    expect(recordId, 'Record ID should be present').to.exist;

    cy.log(`✅ Record created successfully: ${recordId}`);
  });
});


});
