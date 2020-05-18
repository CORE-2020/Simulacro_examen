

const Browser = require("zombie");


describe("User visits the home page.", () => {

    const browser = new Browser();

    before(() => browser.visit("http://localhost:3000") );

    it("should be successful.", () => {
        browser.assert.success();
    });

    it("should see home page.", () => {
        browser.assert.url({pathname: "/"});
    });
});

