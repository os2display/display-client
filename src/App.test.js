describe("Simple app loads", () => {
  it("localhost and simple text", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Display client");
  });
});
