

const Browser = require("zombie");


describe("User visits the author page.", () => {

    const browser = new Browser();

    before(() => browser.visit("http://localhost:3000/author") );

    it("should be successful.", () => {
        browser.assert.success();
    });

    it("should see home page.", () => {
        browser.assert.url({pathname: "/author"});
    });
});

